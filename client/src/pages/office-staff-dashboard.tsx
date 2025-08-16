import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Users,
  DollarSign,
  Plus,
  Building,
  TrendingUp,
  Phone,
  Mail,
  Wrench,
  X,
  Check
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

  const { data: recentWorkOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/work-orders/recent"],
    queryFn: async () => {
      const response = await fetch('/api/work-orders?limit=10');
      if (!response.ok) throw new Error('Failed to fetch work orders');
      return response.json();
    },
  });

  const { data: upcomingLeaseExpirations, isLoading: leasesLoading } = useQuery({
    queryKey: ["/api/tenants/expiring-leases"],
    queryFn: async () => {
      const response = await fetch('/api/tenants/expiring-leases?days=30');
      if (!response.ok) throw new Error('Failed to fetch lease expirations');
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

  const { data: jobStats, isLoading: jobStatsLoading } = useQuery({
    queryKey: ["/api/jobs/completion-stats"],
    queryFn: async () => {
      const response = await fetch('/api/jobs/completion-stats');
      if (!response.ok) throw new Error('Failed to fetch job completion stats');
      return response.json();
    },
  });

  const isLoading = statsLoading || ordersLoading || leasesLoading || approvalsLoading || jobStatsLoading;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Office Staff Dashboard</h2>
          <p className="text-slate-600">Coordinate operations and manage administrative tasks</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button className="servicepro-btn-primary" data-testid="button-new-tenant">
            <Plus className="mr-2 h-4 w-4" />
            New Tenant
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pending Approvals</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-pending-approvals">
                  {stats?.pendingApproval || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="text-amber-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Require attention</p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">High Priority Orders</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-high-priority">
                  {stats?.highPriorityOrders || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Need immediate action</p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Jobs Scheduled</p>
                <p className="text-2xl font-bold text-blue-800 mt-1" data-testid="stat-jobs-scheduled">
                  {jobStats?.scheduled || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Jobs approved and assigned</p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Jobs Completed</p>
                <p className="text-2xl font-bold text-emerald-800 mt-1" data-testid="stat-jobs-completed">
                  {jobStats?.completed || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Jobs finished this period</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Items and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Approvals */}
        <Card className="servicepro-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Approvals</span>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {pendingApprovals?.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p>No pending job approvals</p>
                  <p className="text-sm">All jobs are approved or completed</p>
                </div>
              ) : (
                pendingApprovals?.slice(0, 5).map((job: any) => (
                  <JobApprovalCard key={job.id} job={job} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Lease Expirations */}
        <Card className="servicepro-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upcoming Lease Expirations</span>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {upcomingLeaseExpirations?.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p>No upcoming expirations</p>
                  <p className="text-sm">All leases are current</p>
                </div>
              ) : (
                upcomingLeaseExpirations?.slice(0, 5).map((lease: any) => (
                  <div key={lease.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="text-purple-600 text-sm" size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{lease.name}</p>
                        <p className="text-sm text-slate-600">{lease.propertyName} - Unit {lease.unitNumber}</p>
                        <p className="text-sm text-slate-600">Expires: {new Date(lease.leaseEnd).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium text-slate-800">${lease.monthlyRent}/mo</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-200">
                          <Phone size={12} />
                        </Button>
                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-200">
                          <Mail size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Work Orders */}
      <Card className="servicepro-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Work Orders</span>
            <Button variant="ghost" size="sm" className="text-blue-600">
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid gap-4">
            {recentWorkOrders?.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p>No recent work orders</p>
                <p className="text-sm">Work orders will appear here as they're created</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentWorkOrders?.slice(0, 6).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-blue-600 text-sm" size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{order.title}</p>
                        <p className="text-sm text-slate-600">{order.propertyName}</p>
                        <p className="text-sm text-slate-600">#{order.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="servicepro-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              data-testid="button-process-applications"
            >
              <FileText className="text-blue-600" size={20} />
              <span className="text-sm font-medium">Process Applications</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              data-testid="button-schedule-tours"
            >
              <Calendar className="text-emerald-600" size={20} />
              <span className="text-sm font-medium">Schedule Tours</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              data-testid="button-manage-leases"
            >
              <Users className="text-purple-600" size={20} />
              <span className="text-sm font-medium">Manage Leases</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              data-testid="button-generate-reports"
            >
              <TrendingUp className="text-amber-600" size={20} />
              <span className="text-sm font-medium">Generate Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
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
    mutationFn: (jobId: string) => apiRequest(`/api/jobs/${jobId}/approve`, {
      method: "PUT",
      body: JSON.stringify({ approvedBy: "office-staff-1" }),
      headers: { "Content-Type": "application/json" }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/awaiting-approval"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/completion-stats"] });
      toast({
        title: "Job Approved",
        description: "The job has been approved and assigned to technician",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Approval Failed",
        description: "Unable to approve job. Please try again.",
        variant: "destructive"
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason: string }) => apiRequest(`/api/jobs/${jobId}/reject`, {
      method: "PUT",
      body: JSON.stringify({ rejectedBy: "office-staff-1", reason }),
      headers: { "Content-Type": "application/json" }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/awaiting-approval"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/completion-stats"] });
      toast({
        title: "Job Rejected",
        description: "The job has been rejected and will not be scheduled",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Rejection Failed",
        description: "Unable to reject job. Please try again.",
        variant: "destructive"
      });
    }
  });

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'paint': return 'bg-purple-100 text-purple-800';
      case 'repairs': return 'bg-orange-100 text-orange-800';
      case 'clean': return 'bg-blue-100 text-blue-800';
      case 'carpet': return 'bg-green-100 text-green-800';
      case 'punch': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
          <Wrench className="text-amber-600" size={16} />
        </div>
        <div>
          <p className="font-medium text-slate-800">{job.title}</p>
          <p className="text-sm text-slate-600">#{job.id.slice(0, 8)}</p>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="outline" className={getJobTypeColor(job.type)}>
              {job.type}
            </Badge>
            <span className="text-sm text-slate-600">Est: ${job.budget || '75.00'}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
          onClick={() => approveMutation.mutate(job.id)}
          disabled={approveMutation.isPending}
          data-testid={`button-approve-${job.id}`}
        >
          <Check size={14} className="mr-1" />
          {approveMutation.isPending ? "..." : "Approve"}
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => rejectMutation.mutate({ jobId: job.id, reason: "Budget constraints" })}
          disabled={rejectMutation.isPending}
          data-testid={`button-reject-${job.id}`}
        >
          <X size={14} className="mr-1" />
          {rejectMutation.isPending ? "..." : "Reject"}
        </Button>
      </div>
    </div>
  );
}