import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { apiRequest } from "@/lib/queryClient";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  Clock,
  Shield,
  Building,
  Calendar,
  Plus,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { TurnoverTracker } from "@/components/turnover-tracker";

// Job scheduling form schema
const jobScheduleSchema = z.object({
  jobType: z.string().min(1, "Job type is required"),
  description: z.string().optional(),
  priority: z.string().default("medium"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  assignedTechnicianId: z.string().min(1, "Please assign a technician"),
  propertyId: z.string().min(1, "Please select a property"),
  estimatedHours: z.string().optional(),
  amount: z.string().optional(),
});

type JobScheduleFormData = z.infer<typeof jobScheduleSchema>;

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Suppress unused variable warning temporarily
  void sidebarOpen;
  void setSidebarOpen;

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/admin"],
  });

  // Fetch all properties
  const { data: properties } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Fetch all staff
  const { data: staff } = useQuery({
    queryKey: ["/api/staff"],
  });

  // Fetch scheduled jobs
  const { data: scheduledJobs } = useQuery({
    queryKey: ["/api/jobs"],
  });

  // Filter staff for technicians
  const technicians = (staff as any[])?.filter((member: any) => member.role === 'technician') || [];

  // Job scheduling form
  const jobForm = useForm<JobScheduleFormData>({
    resolver: zodResolver(jobScheduleSchema),
    defaultValues: {
      jobType: "",
      description: "",
      priority: "medium",
      scheduledDate: "",
      assignedTechnicianId: "",
      propertyId: "",
    },
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (data: JobScheduleFormData) => {
      const response = await apiRequest("/api/jobs", "POST", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job scheduled successfully",
        description: "The job has been assigned to the technician.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      jobForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to schedule job",
        description: error.message || "Please check your input and try again.",
        variant: "destructive",
      });
    },
  });

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="text-white" size={18} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Admin Panel</h1>
                <p className="text-xs text-slate-500">ServicePro Management</p>
              </div>
            </div>
            <Badge className="bg-red-100 text-red-700 border-0 text-xs px-3 py-1 rounded-full">
              Administrator
            </Badge>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="px-4 py-4">
          <Tabs defaultValue="overview" className="w-full">
            {/* Mobile Tab Navigation */}
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-xl p-1 mb-6">
              <TabsTrigger value="overview" className="flex flex-col items-center py-2 text-xs rounded-lg">
                <BarChart3 size={16} />
                <span className="mt-1">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex flex-col items-center py-2 text-xs rounded-lg">
                <Calendar size={16} />
                <span className="mt-1">Jobs</span>
              </TabsTrigger>
              <TabsTrigger value="staff" className="flex flex-col items-center py-2 text-xs rounded-lg">
                <Users size={16} />
                <span className="mt-1">Team</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex flex-col items-center py-2 text-xs rounded-lg">
                <Settings size={16} />
                <span className="mt-1">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab - Mobile */}
            <TabsContent value="overview" className="space-y-4 mt-0">
              {/* Financial Stats - Mobile Grid */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-gradient-to-br from-green-400 to-green-500 border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="text-center text-white">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <DollarSign className="text-white" size={18} />
                      </div>
                      <p className="text-white text-xs font-medium opacity-90">Total Revenue</p>
                      <p className="text-xl font-bold text-white mt-1">$124,750</p>
                      <p className="text-xs text-white opacity-75 mt-1">Year to Date</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-400 to-blue-500 border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="text-center text-white">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Wallet className="text-white" size={18} />
                      </div>
                      <p className="text-white text-xs font-medium opacity-90">Payouts</p>
                      <p className="text-xl font-bold text-white mt-1">$67,200</p>
                      <p className="text-xs text-white opacity-75 mt-1">Year to Date</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-400 to-purple-500 border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="text-center text-white">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="text-white" size={18} />
                      </div>
                      <p className="text-white text-xs font-medium opacity-90">Net Profit</p>
                      <p className="text-xl font-bold text-white mt-1">$57,550</p>
                      <p className="text-xs text-white opacity-75 mt-1">46% Margin</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-400 to-amber-500 border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="text-center text-white">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="text-white" size={18} />
                      </div>
                      <p className="text-white text-xs font-medium opacity-90">Active Jobs</p>
                      <p className="text-xl font-bold text-white mt-1">{(scheduledJobs as any[])?.length || 0}</p>
                      <p className="text-xs text-white opacity-75 mt-1">In Progress</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Properties - Mobile */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Building className="text-blue-600" size={20} />
                    Top Properties
                  </h2>
                  <Button variant="ghost" size="sm" className="text-blue-600">View All</Button>
                </div>
                
                <div className="space-y-3">
                  <Card className="shadow-sm border-0">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <Building className="text-green-600" size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">Sunset Gardens</p>
                            <p className="text-xs text-slate-500">142 jobs • 94% complete</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">$67,400</p>
                          <p className="text-xs text-slate-500">Revenue</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm border-0">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Building className="text-blue-600" size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">Oak Ridge Complex</p>
                            <p className="text-xs text-slate-500">118 jobs • 91% complete</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">$57,350</p>
                          <p className="text-xs text-slate-500">Revenue</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Other mobile tabs would go here... */}
          </Tabs>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-600">ServicePro Management Platform</p>
            </div>
          </div>
          <Badge className="bg-red-100 text-red-700 border-0 px-4 py-2 rounded-full">
            <Shield className="mr-2" size={14} />
            Administrator
          </Badge>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="p-6">
        <Tabs defaultValue="overview" className="w-full">
          {/* Desktop Tab Navigation */}
          <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-gray-100 p-1 text-muted-foreground mb-8 gap-1">
            <TabsTrigger 
              value="overview" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2 min-w-fit"
            >
              <BarChart3 size={16} />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="schedule" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2 min-w-fit"
            >
              <Calendar size={16} />
              Job Scheduling
            </TabsTrigger>
            <TabsTrigger 
              value="staff" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2 min-w-fit"
            >
              <Users size={16} />
              Staff Management
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2 min-w-fit"
            >
              <Settings size={16} />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Desktop */}
          <TabsContent value="overview" className="space-y-8">
            {/* Financial Overview - Desktop Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-white">
                    <div className="flex items-center justify-between mb-4">
                      <DollarSign className="text-white" size={28} />
                      <div className="text-right">
                        <p className="text-white text-sm opacity-90">Total Revenue</p>
                        <p className="text-3xl font-bold text-white">$124,750</p>
                      </div>
                    </div>
                    <p className="text-white opacity-75 text-sm">Year to Date Performance</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-white">
                    <div className="flex items-center justify-between mb-4">
                      <Wallet className="text-white" size={28} />
                      <div className="text-right">
                        <p className="text-white text-sm opacity-90">Total Payouts</p>
                        <p className="text-3xl font-bold text-white">$67,200</p>
                      </div>
                    </div>
                    <p className="text-white opacity-75 text-sm">Staff Compensation YTD</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-white">
                    <div className="flex items-center justify-between mb-4">
                      <TrendingUp className="text-white" size={28} />
                      <div className="text-right">
                        <p className="text-white text-sm opacity-90">Net Profit</p>
                        <p className="text-3xl font-bold text-white">$57,550</p>
                      </div>
                    </div>
                    <p className="text-white opacity-75 text-sm">46% Profit Margin</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-white">
                    <div className="flex items-center justify-between mb-4">
                      <Clock className="text-white" size={28} />
                      <div className="text-right">
                        <p className="text-white text-sm opacity-90">Active Jobs</p>
                        <p className="text-3xl font-bold text-white">{(scheduledJobs as any[])?.length || 0}</p>
                      </div>
                    </div>
                    <p className="text-white opacity-75 text-sm">Currently In Progress</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Apartment Turnover Tracking */}
            <div className="mb-8">
              <TurnoverTracker />
            </div>

            {/* Desktop Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Property Performance */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Building className="text-blue-600" size={24} />
                    Property Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <Building className="text-green-600" size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">Sunset Gardens</p>
                          <p className="text-sm text-slate-600">142 jobs completed • 94% success rate</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">$67,400</p>
                        <p className="text-sm text-slate-500">Total Revenue</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Building className="text-blue-600" size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">Oak Ridge Complex</p>
                          <p className="text-sm text-slate-600">118 jobs completed • 91% success rate</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">$57,350</p>
                        <p className="text-sm text-slate-500">Total Revenue</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Clock className="text-purple-600" size={24} />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {(scheduledJobs as any[])?.slice(0, 4).map((job: any) => (
                      <div key={job.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Calendar className="text-blue-600" size={14} />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-800">{job.title}</p>
                              <p className="text-xs text-slate-500">{job.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {job.priority}
                                </Badge>
                                <span className="text-xs text-slate-400">
                                  {new Date(job.scheduledDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!(scheduledJobs as any[])?.length && (
                      <div className="text-center py-6">
                        <Calendar className="mx-auto mb-2 text-gray-400" size={36} />
                        <p className="text-sm text-gray-500">No recent activity</p>
                        <p className="text-xs text-gray-400">Jobs will appear here once scheduled</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other desktop tabs would go here... */}
        </Tabs>
      </div>
    </div>
  );
}