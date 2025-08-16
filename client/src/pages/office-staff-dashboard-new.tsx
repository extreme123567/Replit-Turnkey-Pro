import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Users, 
  Calendar,
  FileText,
  DollarSign,
  Building,
  MessageSquare,
  Send,
  UserCheck,
  Plus,
  Eye,
  Phone,
  TrendingUp,
  Calculator,
  CreditCard,
  Wallet,
  ArrowRight,
  Settings,
  Check,
  X,
  Wrench
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OfficeStats {
  pendingApproval: number;
  highPriorityOrders: number;
  leaseExpirations: number;
  activeStaff: number;
  totalProperties: number;
  totalTenants: number;
}

export default function OfficeStaffDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<OfficeStats>({
    queryKey: ["/api/dashboard/office"],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/office');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const { data: financialSummary, isLoading: financialLoading } = useQuery({
    queryKey: ["/api/financial/summary"],
    queryFn: async () => {
      const response = await fetch('/api/financial/summary');
      if (!response.ok) throw new Error('Failed to fetch financial summary');
      return response.json();
    },
  });

  const { data: scheduledCallbacks, isLoading: callbacksLoading } = useQuery({
    queryKey: ["/api/callbacks/scheduled"],
    queryFn: async () => {
      const response = await fetch('/api/callbacks/scheduled');
      if (!response.ok) throw new Error('Failed to fetch callbacks');
      return response.json();
    },
  });

  const { data: jobStats, isLoading: jobStatsLoading } = useQuery({
    queryKey: ["/api/jobs/completion-stats"],
    queryFn: async () => {
      const response = await fetch('/api/jobs/completion-stats');
      if (!response.ok) throw new Error('Failed to fetch job completion stats');
      return response.json();
    },
  });

  // Modal states
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("dashboard");

  // Form states
  const [messageForm, setMessageForm] = useState({
    recipient: '',
    subject: '',
    message: '',
    recipientType: 'technician' // 'technician' or 'property_manager'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isLoading = statsLoading || financialLoading || callbacksLoading || jobStatsLoading;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Office Staff Dashboard</h1>
          <p className="text-slate-600">Administrative oversight and coordination</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-send-message">
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipient-type">Recipient Type</Label>
                    <Select value={messageForm.recipientType} onValueChange={(value) => setMessageForm({...messageForm, recipientType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technician">Technician</SelectItem>
                        <SelectItem value="property_manager">Property Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="recipient">Recipient</Label>
                    <Select value={messageForm.recipient} onValueChange={(value) => setMessageForm({...messageForm, recipient: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        {messageForm.recipientType === 'technician' ? (
                          <>
                            <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
                            <SelectItem value="sarah-chen">Sarah Chen</SelectItem>
                            <SelectItem value="tom-wilson">Tom Wilson</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="pm-smith">John Smith - Maple Heights</SelectItem>
                            <SelectItem value="pm-jones">Lisa Jones - Oak Grove</SelectItem>
                            <SelectItem value="pm-brown">Mike Brown - Cedar Park</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Message subject"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Your message..."
                    rows={4}
                    value={messageForm.message}
                    onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsMessageModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="servicepro-btn-primary">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="servicepro-btn-primary" data-testid="button-create-work-order">
            <Plus className="mr-2 h-4 w-4" />
            Create Work Order
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab Content */}
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="servicepro-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Jobs Scheduled</p>
                    <p className="text-2xl font-bold text-blue-800 mt-1" data-testid="stat-jobs-scheduled">
                      {jobStats?.scheduled || 12}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-blue-600" size={20} />
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2">Units ready for work</p>
              </CardContent>
            </Card>

            <Card className="servicepro-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Jobs In Progress</p>
                    <p className="text-2xl font-bold text-amber-800 mt-1" data-testid="stat-jobs-in-progress">
                      {jobStats?.inProgress || 8}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-amber-600" size={20} />
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2">Currently being worked</p>
              </CardContent>
            </Card>

            <Card className="servicepro-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Jobs Completed</p>
                    <p className="text-2xl font-bold text-green-800 mt-1" data-testid="stat-jobs-completed">
                      {jobStats?.completed || 47}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={20} />
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2">Ready for inspection</p>
              </CardContent>
            </Card>

            <Card className="servicepro-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Pending Approvals</p>
                    <p className="text-2xl font-bold text-red-800 mt-1" data-testid="stat-pending-approvals">
                      {stats?.pendingApproval || 3}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="text-red-600" size={20} />
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2">Need your approval</p>
              </CardContent>
            </Card>
          </div>

          {/* Job Approval and Staff Assignment Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Job Approval Queue */}
            <Card className="servicepro-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Job Approval Queue</span>
                  <Badge variant="outline">3 pending</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  {/* Extra Dirty Unit Approval */}
                  <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="text-amber-600" size={14} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">Extra Dirty Unit - Unit 205</p>
                          <p className="text-xs text-slate-600">Submitted by: Mike Johnson (Technician)</p>
                          <p className="text-xs text-amber-600 mt-1">Requires additional cleaning time (+3 hours)</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="h-8">
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Extra Repairs Approval */}
                  <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <Wrench className="text-red-600" size={14} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">Extra Drywall Repairs - Unit 301</p>
                          <p className="text-xs text-slate-600">Submitted by: Sarah Chen (Technician)</p>
                          <p className="text-xs text-red-600 mt-1">Additional repairs needed: Bedroom wall damage</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="h-8">
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Job to Calendar Assignment */}
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="text-blue-600" size={14} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">Paint Job - Unit 402</p>
                          <p className="text-xs text-slate-600">Needs staff assignment and scheduling</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Select>
                              <SelectTrigger className="w-32 h-7 text-xs">
                                <SelectValue placeholder="Assign to..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mike">Mike Johnson</SelectItem>
                                <SelectItem value="sarah">Sarah Chen</SelectItem>
                                <SelectItem value="tom">Tom Wilson</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input type="date" className="w-32 h-7 text-xs" />
                          </div>
                        </div>
                      </div>
                      <Button size="sm" className="h-8">
                        <Calendar className="mr-1 h-3 w-3" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scheduled Callbacks */}
            <Card className="servicepro-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Scheduled Callbacks</span>
                  <Badge variant="outline">3 scheduled</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <Phone className="text-red-600" size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 text-sm">Unit 205 - Paint Touch-ups</p>
                        <p className="text-xs text-slate-600">Inspection failed: Paint quality issues</p>
                        <p className="text-xs text-red-600 mt-1">Callback scheduled: Tomorrow 10:00 AM</p>
                        <p className="text-xs text-slate-500">Assigned: Mike Johnson</p>
                      </div>
                      <Badge className="bg-red-100 text-red-800 text-xs">High Priority</Badge>
                    </div>
                  </div>

                  <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Phone className="text-amber-600" size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 text-sm">Unit 301 - Cleaning Issues</p>
                        <p className="text-xs text-slate-600">Inspection failed: Bathroom not fully cleaned</p>
                        <p className="text-xs text-amber-600 mt-1">Callback scheduled: Today 2:00 PM</p>
                        <p className="text-xs text-slate-500">Assigned: Sarah Chen</p>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 text-xs">Medium Priority</Badge>
                    </div>
                  </div>

                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Phone className="text-blue-600" size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 text-sm">Unit 102B - Minor Repairs</p>
                        <p className="text-xs text-slate-600">Inspection passed with minor notes</p>
                        <p className="text-xs text-blue-600 mt-1">Callback scheduled: Friday 9:00 AM</p>
                        <p className="text-xs text-slate-500">Assigned: Tom Wilson</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Low Priority</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Overview Section */}
          <Card className="servicepro-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Financial Overview</span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Reports
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-green-600" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Amount Billed</p>
                      <p className="text-xl font-bold text-green-800">${financialSummary?.totalBilled || '12,450'}</p>
                      <p className="text-xs text-slate-600">This period</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Wallet className="text-blue-600" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Amount Paid Out</p>
                      <p className="text-xl font-bold text-blue-800">${financialSummary?.totalPaidOut || '8,230'}</p>
                      <p className="text-xs text-slate-600">To technicians</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="text-purple-600" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Net Profit</p>
                      <p className="text-xl font-bold text-purple-800">${financialSummary?.netProfit || '4,220'}</p>
                      <p className="text-xs text-slate-600">33.9% margin</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="text-slate-600" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Jobs Completed</p>
                      <p className="text-xl font-bold text-slate-800">{jobStats?.completed || 47}</p>
                      <p className="text-xs text-slate-600">This period</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Accounts Tab Content */}
        <TabsContent value="accounts" className="space-y-6 mt-6">
          <Card className="servicepro-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Accounts & Invoicing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Invoice Management */}
                <div className="space-y-4">
                  <h3 className="font-medium text-slate-800">Invoice Management</h3>
                  <div className="space-y-3">
                    <div className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800">INV-2025-001</p>
                          <p className="text-sm text-slate-600">Maple Heights Apartments</p>
                          <p className="text-xs text-slate-500">Due: Jan 30, 2025</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">$2,450.00</p>
                          <Badge className="bg-green-100 text-green-800">Paid</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800">INV-2025-002</p>
                          <p className="text-sm text-slate-600">Oak Grove Condos</p>
                          <p className="text-xs text-slate-500">Due: Feb 5, 2025</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">$1,890.00</p>
                          <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800">INV-2025-003</p>
                          <p className="text-sm text-slate-600">Cedar Park Complex</p>
                          <p className="text-xs text-slate-500">Due: Jan 25, 2025</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">$3,200.00</p>
                          <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Invoice
                  </Button>
                </div>

                {/* Revenue Tracking */}
                <div className="space-y-4">
                  <h3 className="font-medium text-slate-800">Revenue Tracking</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-green-200 bg-green-50 rounded-lg text-center">
                      <p className="text-sm text-slate-600">This Month</p>
                      <p className="text-2xl font-bold text-green-800">$28,450</p>
                      <p className="text-xs text-slate-500">+12% vs last month</p>
                    </div>
                    <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg text-center">
                      <p className="text-sm text-slate-600">Outstanding</p>
                      <p className="text-2xl font-bold text-blue-800">$5,090</p>
                      <p className="text-xs text-slate-500">3 invoices pending</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-700 text-sm">Quick Actions</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <Button variant="outline" size="sm" className="justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Monthly Report
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        <Send className="mr-2 h-4 w-4" />
                        Send Payment Reminders
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        <Eye className="mr-2 h-4 w-4" />
                        View Aging Report
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab Content */}
        <TabsContent value="payroll" className="space-y-6 mt-6">
          <Card className="servicepro-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payroll Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Pay Period */}
                <div className="space-y-4">
                  <h3 className="font-medium text-slate-800">Current Pay Period</h3>
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-medium text-slate-800">Pay Period 2</p>
                      <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                    </div>
                    <p className="text-sm text-slate-600">Jan 16 - Jan 29, 2025</p>
                    <p className="text-xs text-slate-500">Ends in 5 days</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Total Earned</p>
                        <p className="text-xl font-bold text-slate-800">$8,230</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Jobs Completed</p>
                        <p className="text-xl font-bold text-slate-800">47</p>
                      </div>
                    </div>
                  </div>

                  {/* Individual Technician Payouts */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-700 text-sm">Technician Payouts</h4>
                    
                    <div className="p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800 text-sm">Mike Johnson</p>
                          <p className="text-xs text-slate-600">15 jobs completed</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">$2,875</p>
                          <p className="text-xs text-slate-500">Paint & Clean</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800 text-sm">Sarah Chen</p>
                          <p className="text-xs text-slate-600">18 jobs completed</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">$3,180</p>
                          <p className="text-xs text-slate-500">Clean & Repairs</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800 text-sm">Tom Wilson</p>
                          <p className="text-xs text-slate-600">14 jobs completed</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">$2,175</p>
                          <p className="text-xs text-slate-500">Paint & Carpet</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payroll Actions */}
                <div className="space-y-4">
                  <h3 className="font-medium text-slate-800">Payroll Actions</h3>
                  
                  <div className="space-y-3">
                    <Button className="w-full justify-start">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Process Current Payroll
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Pay Stubs
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Payroll History
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <Calculator className="mr-2 h-4 w-4" />
                      Payout Rate Settings
                    </Button>
                  </div>

                  {/* Recent Payroll Activity */}
                  <div className="mt-6 space-y-3">
                    <h4 className="font-medium text-slate-700 text-sm">Recent Activity</h4>
                    
                    <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800 text-sm">Pay Period 1 Processed</p>
                          <p className="text-xs text-slate-600">Jan 2 - Jan 15, 2025</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-800">$7,450</p>
                          <p className="text-xs text-slate-500">Completed</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800 text-sm">Rate Update Applied</p>
                          <p className="text-xs text-slate-600">3BR cleaning rate increased</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">$95 → $105</p>
                          <p className="text-xs text-slate-500">Jan 15</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Management Tab Content */}
        <TabsContent value="management" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Status Overview */}
            <Card className="servicepro-card">
              <CardHeader>
                <CardTitle>Job Status Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-800">{jobStats?.scheduled || 12}</p>
                    <p className="text-sm text-slate-600">Scheduled</p>
                  </div>
                  <div className="text-center p-4 border border-amber-200 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-800">{jobStats?.inProgress || 8}</p>
                    <p className="text-sm text-slate-600">In Progress</p>
                  </div>
                  <div className="text-center p-4 border border-green-200 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-800">{jobStats?.completed || 47}</p>
                    <p className="text-sm text-slate-600">Completed</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-700 text-sm">Management Actions</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" size="sm" className="justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule New Jobs
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Assign Technicians
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Eye className="mr-2 h-4 w-4" />
                      View All Jobs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Communication Hub */}
            <Card className="servicepro-card">
              <CardHeader>
                <CardTitle>Communication Hub</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">Message from PM</p>
                        <p className="text-xs text-slate-600">John Smith: Unit 205 needs priority</p>
                        <p className="text-xs text-slate-500">2 hours ago</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">Technician Update</p>
                        <p className="text-xs text-slate-600">Mike: Paint job 80% complete</p>
                        <p className="text-xs text-slate-500">1 hour ago</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">Callback Request</p>
                        <p className="text-xs text-slate-600">Unit 301: Cleaning quality issue</p>
                        <p className="text-xs text-slate-500">30 minutes ago</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message Tech
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="mr-2 h-4 w-4" />
                      Message PM
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}