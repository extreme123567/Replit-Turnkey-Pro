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
  Wrench,
  Mail
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

  const { data: pendingApprovals, isLoading: approvalsLoading } = useQuery({
    queryKey: ["/api/jobs/awaiting-approval"],
    queryFn: async () => {
      const response = await fetch('/api/jobs/awaiting-approval');
      if (!response.ok) throw new Error('Failed to fetch pending approvals');
      return response.json();
    },
  });

  const { data: upcomingLeaseExpirations, isLoading: leasesLoading } = useQuery({
    queryKey: ["/api/leases/expiring"],
    queryFn: async () => {
      const response = await fetch('/api/leases/expiring');
      if (!response.ok) throw new Error('Failed to fetch lease expirations');
      return response.json();
    },
  });

  const { data: recentWorkOrders, isLoading: workOrdersLoading } = useQuery({
    queryKey: ["/api/work-orders/recent"],
    queryFn: async () => {
      const response = await fetch('/api/work-orders/recent');
      if (!response.ok) throw new Error('Failed to fetch work orders');
      return response.json();
    },
  });

  if (statsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="text-office-dashboard-title">
          Office Staff Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <UserCheck className="w-4 h-4 mr-1" />
            Office Staff
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium" data-testid="text-pending-approval-label">Pending Approval</p>
                <p className="text-2xl font-bold text-red-700" data-testid="text-pending-approval-count">
                  {stats?.pendingApproval || 0}
                </p>
              </div>
              <AlertTriangle className="text-red-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium" data-testid="text-high-priority-label">High Priority</p>
                <p className="text-2xl font-bold text-orange-700" data-testid="text-high-priority-count">
                  {stats?.highPriorityOrders || 0}
                </p>
              </div>
              <Clock className="text-orange-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium" data-testid="text-lease-expiring-label">Lease Expiring</p>
                <p className="text-2xl font-bold text-yellow-700" data-testid="text-lease-expiring-count">
                  {stats?.leaseExpirations || 0}
                </p>
              </div>
              <Calendar className="text-yellow-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium" data-testid="text-active-staff-label">Active Staff</p>
                <p className="text-2xl font-bold text-green-700" data-testid="text-active-staff-count">
                  {stats?.activeStaff || 0}
                </p>
              </div>
              <Users className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium" data-testid="text-total-properties-label">Properties</p>
                <p className="text-2xl font-bold text-blue-700" data-testid="text-total-properties-count">
                  {stats?.totalProperties || 0}
                </p>
              </div>
              <Building className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium" data-testid="text-total-tenants-label">Tenants</p>
                <p className="text-2xl font-bold text-purple-700" data-testid="text-total-tenants-count">
                  {stats?.totalTenants || 0}
                </p>
              </div>
              <Users className="text-purple-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs" data-testid="tab-jobs">Job Approvals</TabsTrigger>
          <TabsTrigger value="staff" data-testid="tab-staff">Staff Management</TabsTrigger>
          <TabsTrigger value="messaging" data-testid="tab-messaging">Messaging</TabsTrigger>
          <TabsTrigger value="callbacks" data-testid="tab-callbacks">Callbacks</TabsTrigger>
          <TabsTrigger value="billing" data-testid="tab-billing">Billing</TabsTrigger>
          <TabsTrigger value="accounts" data-testid="tab-accounts">Accounts</TabsTrigger>
          <TabsTrigger value="payroll" data-testid="tab-payroll">Payroll</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Job Approvals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="text-red-500" size={20} />
                  <span>Pending Job Approvals</span>
                  <Badge variant="secondary" data-testid="badge-pending-approvals-count">
                    {pendingApprovals?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {approvalsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))
                  ) : pendingApprovals?.length > 0 ? (
                    pendingApprovals.map((job: any) => (
                      <JobApprovalCard key={job.id} job={job} />
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4" data-testid="text-no-pending-approvals">
                      No pending approvals
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Color-Coded Job Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="text-blue-500" size={20} />
                  <span>Job Schedule Calendar</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  {/* Calendar Legend */}
                  <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span>Paint</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Clean</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-black rounded"></div>
                      <span>Punch</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span>Carpet</span>
                    </div>
                  </div>

                  {/* Mini Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {/* Calendar Headers */}
                    <div className="text-xs font-medium text-gray-500 p-1">Sun</div>
                    <div className="text-xs font-medium text-gray-500 p-1">Mon</div>
                    <div className="text-xs font-medium text-gray-500 p-1">Tue</div>
                    <div className="text-xs font-medium text-gray-500 p-1">Wed</div>
                    <div className="text-xs font-medium text-gray-500 p-1">Thu</div>
                    <div className="text-xs font-medium text-gray-500 p-1">Fri</div>
                    <div className="text-xs font-medium text-gray-500 p-1">Sat</div>

                    {/* Calendar Days with Sample Jobs */}
                    <div className="p-1"></div>
                    <div className="p-1"></div>
                    <div className="p-1"></div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">1</div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">2</div>
                      <div className="w-2 h-1 bg-blue-500 rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">3</div>
                      <div className="w-2 h-1 bg-red-500 rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">4</div>
                    </div>

                    <div className="p-1 border rounded">
                      <div className="text-xs">5</div>
                      <div className="w-2 h-1 bg-black rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">6</div>
                      <div className="w-2 h-1 bg-yellow-500 rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">7</div>
                      <div className="w-2 h-1 bg-blue-500 rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">8</div>
                      <div className="w-2 h-1 bg-red-500 rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded bg-blue-50">
                      <div className="text-xs font-medium">9</div>
                      <div className="flex space-x-1 justify-center">
                        <div className="w-1 h-1 bg-blue-500 rounded"></div>
                        <div className="w-1 h-1 bg-red-500 rounded"></div>
                      </div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">10</div>
                      <div className="w-2 h-1 bg-black rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">11</div>
                    </div>

                    <div className="p-1 border rounded">
                      <div className="text-xs">12</div>
                      <div className="w-2 h-1 bg-yellow-500 rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">13</div>
                      <div className="w-2 h-1 bg-blue-500 rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">14</div>
                      <div className="w-2 h-1 bg-red-500 rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">15</div>
                      <div className="w-2 h-1 bg-black rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded bg-green-50">
                      <div className="text-xs font-medium">16</div>
                      <div className="flex space-x-1 justify-center">
                        <div className="w-1 h-1 bg-blue-500 rounded"></div>
                        <div className="w-1 h-1 bg-yellow-500 rounded"></div>
                        <div className="w-1 h-1 bg-red-500 rounded"></div>
                      </div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">17</div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">18</div>
                    </div>

                    <div className="p-1 border rounded">
                      <div className="text-xs">19</div>
                      <div className="w-2 h-1 bg-black rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">20</div>
                      <div className="w-2 h-1 bg-blue-500 rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">21</div>
                      <div className="w-2 h-1 bg-red-500 rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">22</div>
                      <div className="w-2 h-1 bg-yellow-500 rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">23</div>
                      <div className="w-2 h-1 bg-blue-500 rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">24</div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">25</div>
                    </div>

                    <div className="p-1 border rounded">
                      <div className="text-xs">26</div>
                      <div className="w-2 h-1 bg-red-500 rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">27</div>
                      <div className="w-2 h-1 bg-black rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">28</div>
                      <div className="w-2 h-1 bg-yellow-500 rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">29</div>
                      <div className="w-2 h-1 bg-blue-500 rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">30</div>
                      <div className="w-2 h-1 bg-red-500 rounded mx-auto"></div>
                    </div>
                    <div className="p-1 border rounded">
                      <div className="text-xs">31</div>
                    </div>
                    <div className="p-1"></div>
                  </div>

                  {/* Today's Job Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-800 mb-2">Today's Jobs</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span>Paint Jobs</span>
                        <span className="font-medium">2</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span>Clean Jobs</span>
                        <span className="font-medium">1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Work Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="text-gray-500" size={20} />
                <span>Recent Work Orders</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {workOrdersLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))
                ) : recentWorkOrders?.length > 0 ? (
                  recentWorkOrders.map((order: any) => (
                    <div key={order.id} className="p-3 border rounded-lg" data-testid={`card-work-order-${order.id}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{order.description}</p>
                          <p className="text-sm text-gray-600">{order.propertyAddress}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(order.priority)}`}>
                              {order.priority}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${getStatusColor(order.status)}`}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{order.assignedTechnician}</p>
                          <p className="text-xs text-gray-500">{order.createdDate}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4" data-testid="text-no-work-orders">
                    No recent work orders
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Approvals Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <JobApprovalsSection />
        </TabsContent>

        {/* Staff Management Tab */}
        <TabsContent value="staff" className="space-y-6">
          <StaffManagementSection />
        </TabsContent>

        {/* Messaging Tab */}
        <TabsContent value="messaging" className="space-y-6">
          <MessagingSection />
        </TabsContent>

        {/* Callbacks Tab */}
        <TabsContent value="callbacks" className="space-y-6">
          <CallbacksSection />
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <BillingSection />
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <AccountsSection />
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-6">
          <PayrollSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Job Approval Card Component
interface JobApprovalCardProps {
  job: any;
}

function JobApprovalCard({ job }: JobApprovalCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const approveMutation = useMutation({
    mutationFn: (jobId: string) => apiRequest(`/api/jobs/${jobId}/approve`, "PUT", { 
      approvedBy: "office-staff-1" 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/awaiting-approval"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/completion-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/summary"] });
      toast({
        title: "Job Approved",
        description: "The job has been approved and assigned to technician",
        variant: "default"
      });
    },
    onError: () => {
      toast({
        title: "Approval Failed",
        description: "Unable to approve job. Please try again.",
        variant: "destructive"
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason: string }) => 
      apiRequest(`/api/jobs/${jobId}/reject`, "PUT", { 
        reason,
        rejectedBy: "office-staff-1" 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/awaiting-approval"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/completion-stats"] });
      toast({
        title: "Job Rejected",
        description: "The job has been rejected",
        variant: "default"
      });
    }
  });

  return (
    <div className="p-3 border rounded-lg bg-red-50" data-testid={`card-job-approval-${job.id}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-gray-900">{job.type}</p>
          <Badge variant="outline" className={`text-xs mt-1 ${getJobTypeColor(job.type)}`}>
            {job.type}
          </Badge>
          <p className="text-sm text-gray-600 mt-1">{job.description}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            onClick={() => approveMutation.mutate(job.id)}
            disabled={approveMutation.isPending}
            data-testid={`button-approve-${job.id}`}
          >
            <Check size={14} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            onClick={() => rejectMutation.mutate({ jobId: job.id, reason: "Not approved" })}
            disabled={rejectMutation.isPending}
            data-testid={`button-reject-${job.id}`}
          >
            <X size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Job Approvals Section
function JobApprovalsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Approval Queue</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Detailed job approval interface will be implemented here.</p>
      </CardContent>
    </Card>
  );
}

// Staff Management Section
function StaffManagementSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Staff assignment and management tools will be implemented here.</p>
      </CardContent>
    </Card>
  );
}

// Messaging Section
function MessagingSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messaging Center</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Communication tools for technicians and property managers will be implemented here.</p>
      </CardContent>
    </Card>
  );
}

// Callbacks Section
function CallbacksSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Callback Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Callback tracking and management will be implemented here.</p>
      </CardContent>
    </Card>
  );
}

// Billing Section
function BillingSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Billing and payout tracking will be implemented here.</p>
      </CardContent>
    </Card>
  );
}

// Accounts Section
function AccountsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <FileText className="text-blue-600" size={20} />
                  <span>Invoice Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-create-invoice">
                    <Plus className="mr-2" size={16} />
                    Create New Invoice
                  </Button>
                  <Button className="w-full justify-start" variant="outline" data-testid="button-pending-invoices">
                    <Clock className="mr-2" size={16} />
                    Pending Invoices
                  </Button>
                  <Button className="w-full justify-start" variant="outline" data-testid="button-paid-invoices">
                    <CheckCircle className="mr-2" size={16} />
                    Paid Invoices
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <DollarSign className="text-green-600" size={20} />
                  <span>Revenue Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-700">$45,230</p>
                    <p className="text-sm text-green-600">This Month</p>
                  </div>
                  <Button className="w-full" variant="outline" data-testid="button-revenue-report">
                    <TrendingUp className="mr-2" size={16} />
                    View Revenue Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Payroll Section
function PayrollSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-purple-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Calculator className="text-purple-600" size={20} />
                  <span>Payroll Calculator</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline" data-testid="button-calculate-payroll">
                    <Calculator className="mr-2" size={16} />
                    Calculate Payroll
                  </Button>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-purple-700">$12,450</p>
                    <p className="text-sm text-purple-600">Current Period</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <CreditCard className="text-orange-600" size={20} />
                  <span>Payment Processing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline" data-testid="button-process-payments">
                    <Send className="mr-2" size={16} />
                    Process Payments
                  </Button>
                  <Button className="w-full" variant="outline" data-testid="button-payment-history">
                    <Clock className="mr-2" size={16} />
                    Payment History
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-teal-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Wallet className="text-teal-600" size={20} />
                  <span>Tax & Benefits</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline" data-testid="button-tax-documents">
                    <FileText className="mr-2" size={16} />
                    Tax Documents
                  </Button>
                  <Button className="w-full" variant="outline" data-testid="button-benefits-admin">
                    <Users className="mr-2" size={16} />
                    Benefits Admin
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Payroll Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payroll Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Bi-weekly Payroll - Period 15</p>
                    <p className="text-sm text-gray-600">Processed on Aug 15, 2025</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Completed
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Bonus Payments - Q3</p>
                    <p className="text-sm text-gray-600">Scheduled for Aug 20, 2025</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Pending
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function getPriorityColor(priority: string) {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'medium':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-green-50 text-green-700 border-green-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'in-progress':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'completed':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

function getJobTypeColor(type: string) {
  switch (type?.toLowerCase()) {
    case 'extra dirty':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'extra repairs':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'paint':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'clean':
      return 'bg-green-50 text-green-700 border-green-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}