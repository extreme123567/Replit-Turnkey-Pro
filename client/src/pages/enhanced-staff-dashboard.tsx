import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Clock,
  Users,
  Briefcase,
  Calculator,
  Eye,
  UserCheck
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

interface StaffMetrics {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  yearToDateEarnings: number;
  completedJobs: number;
  pendingCallbacks: number;
  resolvedCallbacks: number;
  efficiency: number;
  averageJobValue: number;
  monthlyEarnings: number[];
}

interface InvoiceMetrics {
  totalJobs: number;
  invoicedJobs: number;
  uninvoicedJobs: number;
  pendingInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalInvoicedAmount: number;
  totalPaidAmount: number;
  averageInvoiceValue: number;
}

export default function EnhancedStaffDashboard() {
  const { data: staffMetrics, isLoading: staffLoading } = useQuery<StaffMetrics[]>({
    queryKey: ["/api/staff/metrics"],
    queryFn: () => fetch("/api/staff/metrics").then(res => res.json()),
  });

  const { data: invoiceMetrics, isLoading: invoiceLoading } = useQuery<InvoiceMetrics>({
    queryKey: ["/api/invoices/metrics"],
    queryFn: () => fetch("/api/invoices/metrics").then(res => res.json()),
  });

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on_job': return 'bg-blue-100 text-blue-800';
      case 'vacation': return 'bg-purple-100 text-purple-800';
      case 'sick_leave': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (staffLoading || invoiceLoading) {
    return (
      <div className="space-y-6 p-4 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Staff Performance Dashboard</h1>
          <p className="text-slate-600">Comprehensive staff metrics and invoice tracking</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Eye className="mr-2 h-4 w-4" />
          View Reports
        </Button>
      </div>

      <Tabs defaultValue="staff" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="staff">👥 Staff Performance</TabsTrigger>
          <TabsTrigger value="invoices">📋 Invoice Tracking</TabsTrigger>
        </TabsList>

        {/* Staff Performance Tab */}
        <TabsContent value="staff" className="space-y-6 mt-6">
          {/* Staff Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Staff</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {staffMetrics?.length || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total YTD Earnings</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(staffMetrics?.reduce((sum, staff) => sum + staff.yearToDateEarnings, 0) || 0)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Completed Jobs</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {staffMetrics?.reduce((sum, staff) => sum + staff.completedJobs, 0) || 0}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Active Callbacks</p>
                    <p className="text-2xl font-bold text-red-600">
                      {staffMetrics?.reduce((sum, staff) => sum + staff.pendingCallbacks, 0) || 0}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Individual Staff Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Individual Staff Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffMetrics?.map((staff) => (
                  <div key={staff.id} className="border rounded-lg p-4 bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-bold text-blue-700">
                            {staff.firstName[0]}{staff.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {staff.firstName} {staff.lastName}
                          </h3>
                          <p className="text-sm text-slate-600">{staff.role}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(staff.status)}>
                        {staff.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-slate-600">YTD Earnings</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(staff.yearToDateEarnings)}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Completed Jobs</p>
                        <p className="text-lg font-bold text-blue-600">
                          {staff.completedJobs}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Pending Callbacks</p>
                        <p className="text-lg font-bold text-red-600">
                          {staff.pendingCallbacks}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Resolved Callbacks</p>
                        <p className="text-lg font-bold text-green-600">
                          {staff.resolvedCallbacks}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Efficiency</p>
                        <p className={`text-lg font-bold ${getEfficiencyColor(staff.efficiency)}`}>
                          {formatPercentage(staff.efficiency)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Average Job Value:</span>
                        <span className="font-medium">{formatCurrency(staff.averageJobValue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Tracking Tab */}
        <TabsContent value="invoices" className="space-y-6 mt-6">
          {/* Invoice Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Jobs</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {invoiceMetrics?.totalJobs || 0}
                    </p>
                  </div>
                  <Briefcase className="h-8 w-8 text-slate-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Jobs Invoiced</p>
                    <p className="text-2xl font-bold text-green-600">
                      {invoiceMetrics?.invoicedJobs || 0}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {invoiceMetrics?.totalJobs 
                    ? formatPercentage((invoiceMetrics.invoicedJobs / invoiceMetrics.totalJobs) * 100)
                    : '0%'} of total jobs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Jobs Not Invoiced</p>
                    <p className="text-2xl font-bold text-red-600">
                      {invoiceMetrics?.uninvoicedJobs || 0}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-xs text-red-600 mt-1">
                  Requires immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Invoiced</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(invoiceMetrics?.totalInvoicedAmount || 0)}
                    </p>
                  </div>
                  <Calculator className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Pending Invoices</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {invoiceMetrics?.pendingInvoices || 0}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Paid Invoices</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {invoiceMetrics?.paidInvoices || 0}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="font-medium">Overdue Invoices</span>
                    </div>
                    <Badge className="bg-red-100 text-red-800">
                      {invoiceMetrics?.overdueInvoices || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">Total Invoiced Amount</span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(invoiceMetrics?.totalInvoicedAmount || 0)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">Total Paid Amount</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(invoiceMetrics?.totalPaidAmount || 0)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">Outstanding Amount</span>
                      <span className="font-bold text-red-600">
                        {formatCurrency((invoiceMetrics?.totalInvoicedAmount || 0) - (invoiceMetrics?.totalPaidAmount || 0))}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Average Invoice Value</span>
                      <span className="font-bold text-slate-800">
                        {formatCurrency(invoiceMetrics?.averageInvoiceValue || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Action Items</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(invoiceMetrics?.uninvoicedJobs || 0) > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <p className="font-medium text-red-800">
                        {invoiceMetrics?.uninvoicedJobs} jobs need to be invoiced
                      </p>
                      <p className="text-sm text-red-600">
                        These completed jobs are missing invoices and affecting cash flow
                      </p>
                    </div>
                    <Button className="bg-red-600 hover:bg-red-700">
                      Create Invoices
                    </Button>
                  </div>
                )}

                {(invoiceMetrics?.overdueInvoices || 0) > 0 && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-800">
                        {invoiceMetrics?.overdueInvoices} invoices are overdue
                      </p>
                      <p className="text-sm text-yellow-600">
                        Follow up with clients for payment collection
                      </p>
                    </div>
                    <Button variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-50">
                      Send Reminders
                    </Button>
                  </div>
                )}

                {(invoiceMetrics?.uninvoicedJobs || 0) === 0 && (invoiceMetrics?.overdueInvoices || 0) === 0 && (
                  <div className="text-center py-8 text-green-600">
                    <CheckCircle className="mx-auto h-12 w-12 mb-4" />
                    <p className="font-medium">All invoices are up to date!</p>
                    <p className="text-sm text-slate-600">No action items at this time</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}