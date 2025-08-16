import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  MapPin,
  Calendar,
  Settings,
  Timer,
  Plus,
  Camera,
  FileText,
  Navigation,
  AlertTriangle,
  Trash2,
  Upload
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Complete Job with Payout Component
const CompleteJobButton = ({ technicianId, jobType }: { technicianId: string; jobType: 'paint' | 'clean' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [unitCount, setUnitCount] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const completeJobWithPayout = useMutation({
    mutationFn: async (data: any) => {
      // Create the payout first
      await apiRequest("/api/payroll/create-payout", "POST", {
        jobId: `demo-${jobType}-job-${Date.now()}`,
        staffId: technicianId,
        jobType: data.jobType,
        unitCount: data.unitCount
      });
      return data;
    },
    onSuccess: () => {
      toast({
        title: `${jobType.charAt(0).toUpperCase() + jobType.slice(1)} Job Completed`,
        description: `Payout of $${jobType === 'paint' ? 85 * unitCount : 75 * unitCount} has been added to your account.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/staff", technicianId] });
      setUnitCount(1);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to complete ${jobType} job. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const handleCompleteJob = () => {
    setIsLoading(true);
    completeJobWithPayout.mutate({ jobType, unitCount });
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min="1"
          max="10"
          value={unitCount}
          onChange={(e) => setUnitCount(parseInt(e.target.value) || 1)}
          className="w-16 px-2 py-1 text-sm border rounded"
          placeholder="1"
        />
        <span className="text-sm text-slate-600">units</span>
      </div>
      <Button 
        variant="outline" 
        className={`h-20 flex-col space-y-2 w-full ${jobType === 'paint' ? 'border-blue-200 hover:bg-blue-50' : 'border-green-200 hover:bg-green-50'}`}
        onClick={handleCompleteJob}
        disabled={isLoading || completeJobWithPayout.isPending}
        data-testid={`button-complete-${jobType}-job`}
      >
        <div className={`w-8 h-8 ${jobType === 'paint' ? 'bg-blue-500' : 'bg-green-500'} rounded-full`}></div>
        <span className="text-sm font-medium">
          Complete {jobType.charAt(0).toUpperCase() + jobType.slice(1)} Job
        </span>
        <span className="text-xs text-slate-500">
          ${jobType === 'paint' ? 85 * unitCount : 75 * unitCount}
        </span>
      </Button>
    </div>
  );
};

interface TechnicianStats {
  assignedOrders: number;
  completedToday: number;
  completedThisWeek: number;
  todaysSchedule: any[];
}

export default function TechnicianDashboard() {
  // For demo, we'll use a mock technician ID
  const technicianId = "tech-1";

  const { data: stats, isLoading: statsLoading } = useQuery<TechnicianStats>({
    queryKey: ["/api/dashboard/technician", technicianId],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/technician/${technicianId}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const { data: assignedOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/work-orders/technician", technicianId],
    queryFn: async () => {
      const response = await fetch(`/api/work-orders/technician/${technicianId}`);
      if (!response.ok) throw new Error('Failed to fetch assigned orders');
      return response.json();
    },
  });

  const { data: todaysSchedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ["/api/work-orders/today", technicianId],
    queryFn: async () => {
      const response = await fetch(`/api/work-orders/today/${technicianId}`);
      if (!response.ok) throw new Error('Failed to fetch today\'s schedule');
      return response.json();
    },
  });

  const { data: payrollData, isLoading: payrollLoading } = useQuery({
    queryKey: ["/api/payroll/staff", technicianId],
    queryFn: async () => {
      const response = await fetch(`/api/payroll/staff/${technicianId}`);
      if (!response.ok) throw new Error('Failed to fetch payroll data');
      return response.json();
    },
  });

  const isLoading = statsLoading || ordersLoading || scheduleLoading;

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
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'on_hold': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Component for Extra Dirty Request button
  const ExtraDirtyButton = ({ technicianId }: { technicianId: string }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const createExtraDirtyRequest = useMutation({
      mutationFn: async (data: any) => {
        return await apiRequest("/api/extra-dirty-requests", "POST", data);
      },
      onSuccess: () => {
        toast({
          title: "Extra Dirty Request Submitted",
          description: "Your request has been sent to office staff for review.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to submit extra dirty request. Please try again.",
          variant: "destructive",
        });
      },
    });

    const handleExtraDirtyRequest = async () => {
      setIsLoading(true);
      try {
        await createExtraDirtyRequest.mutateAsync({
          technicianId,
          jobId: "current-job-id", // Would come from selected job
          reason: "Unit requires additional cleaning time",
          description: "This unit is significantly dirtier than standard and will require extra time and resources to complete properly.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Button 
        variant="outline" 
        className="h-20 flex-col space-y-2"
        onClick={handleExtraDirtyRequest}
        disabled={isLoading}
        data-testid="button-extra-dirty"
      >
        <Trash2 className="text-orange-600" size={20} />
        <span className="text-sm font-medium">Extra Dirty</span>
      </Button>
    );
  };

  // Component for Repair Photo Upload button
  const RepairPhotoButton = ({ painterId }: { painterId: string }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleRepairPhotos = () => {
      toast({
        title: "Photo Upload",
        description: "Repair photo upload feature coming soon.",
      });
    };

    return (
      <Button 
        variant="outline" 
        className="h-20 flex-col space-y-2"
        onClick={handleRepairPhotos}
        disabled={isLoading}
        data-testid="button-repair-photos"
      >
        <Upload className="text-purple-600" size={20} />
        <span className="text-sm font-medium">Repair Photos</span>
      </Button>
    );
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
          <h2 className="text-3xl font-bold text-slate-800">Technician Dashboard</h2>
          <p className="text-slate-600">Your work orders and daily schedule</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button className="servicepro-btn-primary" data-testid="button-clock-in">
            <Timer className="mr-2 h-4 w-4" />
            Clock In
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Assigned Orders</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-assigned-orders">
                  {stats?.assignedOrders || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wrench className="text-blue-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Active work orders</p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Completed Today</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-completed-today">
                  {stats?.completedToday || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Tasks finished</p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">This Week</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-completed-week">
                  {stats?.completedThisWeek || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-purple-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Weekly progress</p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">This Month's Pay</p>
                <p className="text-2xl font-bold text-emerald-800 mt-1" data-testid="stat-monthly-pay">
                  ${payrollData?.summary?.netPay || "0.00"}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-600" size={20} />
              </div>
            </div>
            {payrollData?.summary?.totalDeducted > 0 && (
              <p className="text-sm text-red-600 mt-1">
                ${payrollData.summary.totalDeducted} deducted for callbacks
              </p>
            )}
            <p className="text-sm text-slate-600 mt-1">Net earnings after callbacks</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Rates for Paint and Clean Jobs */}
      <Card className="servicepro-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-emerald-600" size={16} />
            </div>
            <span>Payout Rates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Paint Job Rate */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-blue-800">Paint Jobs</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Per Unit
                </Badge>
              </div>
              <p className="text-2xl font-bold text-blue-800">$85.00</p>
              <p className="text-sm text-blue-600">Fixed rate per unit painted</p>
            </div>

            {/* Clean Job Rate */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-800">Clean Jobs</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Per Unit
                </Badge>
              </div>
              <p className="text-2xl font-bold text-green-800">$75.00</p>
              <p className="text-sm text-green-600">Fixed rate per unit cleaned</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="text-amber-600 mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-amber-800">Payment Schedule</p>
                <p className="text-sm text-amber-700">
                  Paint and clean job payments are processed weekly every Friday. 
                  Deductions may apply for failed inspections or callback work.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Summary */}
      {payrollData?.entries?.length > 0 && (
        <Card className="servicepro-card">
          <CardHeader>
            <CardTitle>Pay Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payrollData.entries.slice(0, 5).map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">{entry.jobType} job</p>
                    <p className="text-sm text-slate-600">Job #{entry.jobId}</p>
                    {(entry.jobType === 'paint' || entry.jobType === 'clean') && (
                      <p className="text-xs text-blue-600">
                        Fixed rate: ${entry.jobType === 'paint' ? '85.00' : '75.00'} per unit
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${entry.payStatus === 'deducted' ? 'text-red-600' : 'text-emerald-600'}`}>
                      ${entry.currentPayAmount}
                    </p>
                    <Badge variant={entry.payStatus === 'deducted' ? 'destructive' : 'secondary'}>
                      {entry.payStatus === 'deducted' ? 'Deducted' : entry.payStatus === 'restored' ? 'Restored' : 'Earned'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Schedule and Assigned Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <Card className="servicepro-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Today's Schedule</span>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View Calendar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {todaysSchedule?.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p>No scheduled jobs today</p>
                  <p className="text-sm">Enjoy a lighter workload!</p>
                </div>
              ) : (
                todaysSchedule?.slice(0, 5).map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="text-blue-600 text-sm" size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{job.title}</p>
                        <p className="text-sm text-slate-600 flex items-center">
                          <MapPin className="mr-1" size={12} />
                          {job.propertyName}
                        </p>
                        <p className="text-sm text-slate-600">
                          {formatTime(job.scheduledDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className={getPriorityColor(job.priority)}>
                        {job.priority}
                      </Badge>
                      <Button size="sm" variant="outline" className="text-blue-600 border-blue-200">
                        <Navigation size={12} className="mr-1" />
                        Navigate
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assigned Work Orders */}
        <Card className="servicepro-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Assigned Work Orders</span>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {assignedOrders?.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Wrench className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p>No assigned orders</p>
                  <p className="text-sm">New work orders will appear here</p>
                </div>
              ) : (
                assignedOrders?.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Wrench className="text-amber-600 text-sm" size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{order.title}</p>
                        <p className="text-sm text-slate-600">#{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-slate-600 flex items-center">
                          <MapPin className="mr-1" size={12} />
                          {order.propertyName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" className="px-2">
                          <Timer size={12} />
                        </Button>
                        <Button size="sm" variant="outline" className="px-2">
                          <FileText size={12} />
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

      {/* Quick Actions */}
      <Card className="servicepro-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CompleteJobButton technicianId={technicianId} jobType="paint" />
            <CompleteJobButton technicianId={technicianId} jobType="clean" />
            <ExtraDirtyButton technicianId={technicianId} />
            <RepairPhotoButton painterId={technicianId} />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="servicepro-card border-red-200 bg-red-50/50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">Emergency Situations</h3>
              <p className="text-red-700 text-sm">For urgent situations requiring immediate assistance</p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white" data-testid="button-emergency-contact">
              Emergency Contact
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}