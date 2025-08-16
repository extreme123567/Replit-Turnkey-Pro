import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Eye, Download, Send, Bell, AlertTriangle, CheckCircle, FileText, ExternalLink, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceForm } from "@/components/forms/invoice-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Invoice, Client, Job } from "@shared/schema";

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Check for QuickBooks connection callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('qb_connected') === 'true') {
      toast({
        title: "QuickBooks Connected",
        description: "Successfully connected to QuickBooks Online",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  // QuickBooks connection status
  const { data: qbStatus, isLoading: qbStatusLoading, refetch: refetchQbStatus } = useQuery({
    queryKey: ["/api/quickbooks/status"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  const isLoading = invoicesLoading || clientsLoading || jobsLoading;

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update invoice');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
  });

  // QuickBooks authentication mutation
  const qbAuthMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/quickbooks/auth", "GET");
    },
    onSuccess: (data: any) => {
      window.location.href = data.authUrl;
    },
    onError: () => {
      toast({
        title: "Authentication Error",
        description: "Failed to start QuickBooks authentication",
        variant: "destructive",
      });
    },
  });

  // Invoice sync to QuickBooks mutation
  const syncToQbMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      return await apiRequest(`/api/invoices/${invoiceId}/sync-to-quickbooks`, "POST");
    },
    onSuccess: (data: any) => {
      toast({
        title: "Invoice Synced",
        description: `Invoice successfully synced to QuickBooks (Doc #${data.docNumber})`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.details || "Failed to sync invoice to QuickBooks",
        variant: "destructive",
      });
    },
  });

  const filteredInvoices = invoices?.filter(invoice => {
    const client = clients?.find(c => c.id === invoice.clientId);
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getClientName = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  const getClientAddress = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    return client ? client.address : '';
  };

  const getJobTitle = (jobId: string | null) => {
    if (!jobId) return 'General Service';
    const job = jobs?.find(j => j.id === jobId);
    return job ? job.title : 'Unknown Job';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-100 text-emerald-800">Paid</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case 'draft':
        return <Badge className="bg-slate-100 text-slate-800">Draft</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
    }
  };

  const isOverdue = (invoice: Invoice) => {
    if (invoice.status === 'paid') return false;
    return new Date(invoice.dueDate) < new Date();
  };

  const calculateSummaryStats = () => {
    if (!invoices) return { totalOutstanding: 0, paidThisMonth: 0, draftCount: 0 };

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const outstanding = invoices
      .filter(inv => inv.status !== 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

    const paidThisMonth = invoices
      .filter(inv => inv.status === 'paid' && inv.paidDate && new Date(inv.paidDate) >= firstOfMonth)
      .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

    const draftCount = invoices.filter(inv => inv.status === 'draft').length;

    return { totalOutstanding: outstanding, paidThisMonth, draftCount };
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    updateInvoiceMutation.mutate({
      id: invoiceId,
      updates: { status: 'paid', paidDate: new Date().toISOString() }
    });
  };

  const handleSendInvoice = (invoiceId: string) => {
    updateInvoiceMutation.mutate({
      id: invoiceId,
      updates: { status: 'sent' }
    });
  };

  const stats = calculateSummaryStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Invoice Management</h3>
          <p className="text-slate-600">Create and manage invoices</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="servicepro-btn-primary" data-testid="button-create-invoice">
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <InvoiceForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* QuickBooks Integration Status */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="text-blue-600" size={20} />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-800">QuickBooks Integration</CardTitle>
                <p className="text-sm text-slate-600">Sync invoices directly to QuickBooks Online</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!qbStatusLoading && (
                <Badge className={qbStatus?.connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {qbStatus?.connected ? "Connected" : "Not Connected"}
                </Badge>
              )}
              {qbStatus?.connected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchQbStatus()}
                  disabled={qbStatusLoading}
                  data-testid="button-refresh-qb-status"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${qbStatusLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              ) : (
                <Button
                  onClick={() => qbAuthMutation.mutate()}
                  disabled={qbAuthMutation.isPending}
                  data-testid="button-connect-quickbooks"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {qbAuthMutation.isPending ? "Connecting..." : "Connect QuickBooks"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {qbStatus?.connected ? (
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>Company ID: {qbStatus.companyId}</span>
              <span>•</span>
              <span>Connection expires: {new Date(qbStatus.expiresAt).toLocaleDateString()}</span>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Connect your QuickBooks Online account to automatically sync invoices and streamline your accounting workflow.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Outstanding</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-outstanding">
                  ${stats.totalOutstanding.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-amber-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {invoices?.filter(inv => inv.status !== 'paid').length || 0} unpaid invoices
            </p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Paid This Month</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-paid-month">
                  ${stats.paidThisMonth.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {invoices?.filter(inv => {
                const now = new Date();
                const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return inv.status === 'paid' && inv.paidDate && new Date(inv.paidDate) >= firstOfMonth;
              }).length || 0} invoices paid
            </p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Draft Invoices</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-drafts">
                  {stats.draftCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="text-blue-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Ready to send</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="servicepro-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-slate-800">Recent Invoices</h4>
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Invoices</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  type="text"
                  placeholder="Search invoices..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-invoices"
                />
              </div>
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {invoices?.length === 0 ? (
                <>
                  <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p>No invoices yet</p>
                  <p className="text-sm">Create your first invoice to get started</p>
                </>
              ) : (
                <p>No invoices match your search criteria</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>QuickBooks</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} data-testid={`invoice-row-${invoice.id}`}>
                      <TableCell>
                        <span className="font-medium text-blue-600">{invoice.invoiceNumber}</span>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-800">{getClientName(invoice.clientId)}</div>
                        <div className="text-sm text-slate-600">{getClientAddress(invoice.clientId)}</div>
                      </TableCell>
                      <TableCell className="text-slate-800">{getJobTitle(invoice.jobId)}</TableCell>
                      <TableCell>
                        <span className="font-bold text-slate-800">${invoice.total}</span>
                      </TableCell>
                      <TableCell className="text-slate-800">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className={isOverdue(invoice) ? 'text-red-600 font-medium' : 'text-slate-800'}>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(isOverdue(invoice) && invoice.status !== 'paid' ? 'overdue' : invoice.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {qbStatus?.connected ? (
                            invoice.quickbooksId ? (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Synced (#{invoice.quickbooksDocNumber})
                              </Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => syncToQbMutation.mutate(invoice.id)}
                                disabled={syncToQbMutation.isPending}
                                data-testid={`button-sync-qb-${invoice.id}`}
                                className="text-xs"
                              >
                                {syncToQbMutation.isPending ? "Syncing..." : "Sync to QB"}
                              </Button>
                            )
                          ) : (
                            <span className="text-xs text-slate-400">QB Not Connected</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            data-testid={`button-view-${invoice.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            data-testid={`button-download-${invoice.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {invoice.status === 'draft' ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleSendInvoice(invoice.id)}
                              data-testid={`button-send-${invoice.id}`}
                            >
                              <Send className="h-4 w-4 text-emerald-600" />
                            </Button>
                          ) : invoice.status !== 'paid' ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                              data-testid={`button-mark-paid-${invoice.id}`}
                            >
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            </Button>
                          ) : null}
                          {isOverdue(invoice) && invoice.status !== 'paid' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              data-testid={`button-reminder-${invoice.id}`}
                            >
                              <Bell className="h-4 w-4 text-amber-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
