import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { 
  DollarSign,
  TrendingUp,
  Users,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Wallet,
  Calculator,
  FileText,
  Settings,
  Shield,
  Eye,
  UserCheck,
  MapPin,
  Phone,
  Mail,
  Wrench,
  Home,
  Plus,
  ClipboardCheck
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { insertJobSchema, type InsertJob } from "@shared/schema";
import { z } from "zod";

interface AdminStats {
  totalRevenue: number;
  totalPayouts: number;
  netProfit: number;
  activeJobs: number;
  totalProperties: number;
  activeProperties: number;
  propertiesAcquiredYTD: number;
  propertiesLostYTD: number;
  turnoverRate: number;
  propertyRetentionRate: number;
  averageRevenuePerProperty: number;
  totalStaff: number;
  totalTenants: number;
  monthlyGrowth: number;
  pendingQuoteRequests: number;
}

interface FinancialSummary {
  totalBilled: string;
  totalPaidOut: string;
  netProfit: string;
  monthlyRevenue: number[];
  payoutHistory: number[];
}

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
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/dashboard/admin"],
  });

  // Fetch financial summary
  const { data: financial, isLoading: financialLoading } = useQuery<FinancialSummary>({
    queryKey: ["/api/financial/admin-summary"],
  });

  // Fetch all properties for admin overview
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Fetch all staff for management
  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ["/api/staff"],
  });

  // Fetch scheduled jobs for admin overview
  const { data: scheduledJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs"],
  });

  // Filter staff for technicians
  const technicians = Array.isArray(staff) ? staff.filter((member: any) => member.role === 'technician') : [];

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
      const response = await apiRequest("/api/jobs", {
        method: "POST",
        body: JSON.stringify(data),
      });
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

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-600">ServicePro Management</p>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/staff/enhanced">
              <Button variant="outline" size="sm" className="text-xs">
                <UserCheck className="mr-1" size={12} />
                Staff Analytics
              </Button>
            </Link>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs px-2 py-1">
              <Shield className="mr-1" size={10} />
              Admin
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Financial Overview Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="text-green-600" size={16} />
                </div>
                <p className="text-green-600 text-xs font-medium">Total Revenue</p>
                <p className="text-lg font-bold text-green-700 mt-1" data-testid="stat-total-revenue">
                  ${stats?.totalRevenue?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-green-600 mt-1">YTD</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Wallet className="text-blue-600" size={16} />
                </div>
                <p className="text-blue-600 text-xs font-medium">Total Payouts</p>
                <p className="text-lg font-bold text-blue-700 mt-1" data-testid="stat-total-payouts">
                  ${stats?.totalPayouts?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-blue-600 mt-1">YTD</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calculator className="text-purple-600" size={16} />
                </div>
                <p className="text-purple-600 text-xs font-medium">Net Profit</p>
                <p className="text-lg font-bold text-purple-700 mt-1" data-testid="stat-net-profit">
                  ${stats?.netProfit?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-purple-600 mt-1">YTD</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Building className="text-orange-600" size={16} />
                </div>
                <p className="text-orange-600 text-xs font-medium">Properties</p>
                <p className="text-lg font-bold text-orange-700 mt-1" data-testid="stat-total-properties">
                  {stats?.totalProperties || "0"}
                </p>
                <p className="text-xs text-orange-600 mt-1">Active</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business KPI Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="text-green-600" size={20} />
                    <span>Business Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Active Jobs</span>
                      <span className="font-semibold text-slate-800" data-testid="stat-active-jobs">
                        {stats?.activeJobs || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Total Staff</span>
                      <span className="font-semibold text-slate-800" data-testid="stat-total-staff">
                        {stats?.totalStaff || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Monthly Growth</span>
                      <span className="font-semibold text-green-600" data-testid="stat-monthly-growth">
                        +{stats?.monthlyGrowth || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Avg Revenue/Property</span>
                      <span className="font-semibold text-slate-800" data-testid="stat-avg-revenue">
                        ${stats?.averageRevenuePerProperty?.toLocaleString() || "0"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="text-blue-600" size={20} />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                      <CheckCircle className="text-green-600" size={16} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">Job Completed</p>
                        <p className="text-xs text-slate-600">Unit 3A maintenance finished</p>
                      </div>
                      <span className="text-xs text-slate-500">2h ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                      <AlertTriangle className="text-yellow-600" size={16} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">Quote Requested</p>
                        <p className="text-xs text-slate-600">Unit 7B painting estimate</p>
                      </div>
                      <span className="text-xs text-slate-500">4h ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                      <Users className="text-blue-600" size={16} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">Staff Added</p>
                        <p className="text-xs text-slate-600">New technician onboarded</p>
                      </div>
                      <span className="text-xs text-slate-500">1d ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Schedule New Job */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="text-blue-600" size={20} />
                    <span>Schedule New Job</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...jobForm}>
                    <form onSubmit={jobForm.handleSubmit((data) => createJobMutation.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={jobForm.control}
                          name="jobType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-job-type">
                                    <SelectValue placeholder="Select job type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="cleaning">Cleaning</SelectItem>
                                  <SelectItem value="painting">Painting</SelectItem>
                                  <SelectItem value="maintenance">Maintenance</SelectItem>
                                  <SelectItem value="inspection">Inspection</SelectItem>
                                  <SelectItem value="repair">Repair</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={jobForm.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-priority">
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="emergency">Emergency</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={jobForm.control}
                        name="propertyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-property">
                                  <SelectValue placeholder="Select property" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.isArray(properties) ? properties.map((property: any) => (
                                  <SelectItem key={property.id} value={property.id}>
                                    {property.name}
                                  </SelectItem>
                                )) : []}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={jobForm.control}
                        name="assignedTechnicianId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assign Technician</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-technician">
                                  <SelectValue placeholder="Select technician" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {technicians.map((tech: any) => (
                                  <SelectItem key={tech.id} value={tech.id}>
                                    {tech.firstName} {tech.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={jobForm.control}
                        name="scheduledDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scheduled Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                data-testid="input-scheduled-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={jobForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Job description..."
                                {...field}
                                data-testid="textarea-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={createJobMutation.isPending}
                        data-testid="button-schedule-job"
                      >
                        {createJobMutation.isPending ? (
                          <>
                            <Clock className="mr-2" size={16} />
                            Scheduling...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2" size={16} />
                            Schedule Job
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Scheduled Jobs Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ClipboardCheck className="text-green-600" size={20} />
                    <span>Scheduled Jobs</span>
                    <Badge variant="secondary">
                      {Array.isArray(scheduledJobs) ? scheduledJobs.length : 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16" />
                      ))
                    ) : Array.isArray(scheduledJobs) && scheduledJobs.length ? (
                      scheduledJobs.slice(0, 5).map((job: any) => (
                        <div key={job.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-800">{job.jobType || job.title}</p>
                              <p className="text-sm text-slate-600">{job.description}</p>
                            </div>
                            <div className="text-right">
                              <Badge 
                                variant={
                                  job.priority === "emergency" ? "destructive" :
                                  job.priority === "high" ? "default" : 
                                  "secondary"
                                }
                              >
                                {job.priority}
                              </Badge>
                              <p className="text-xs text-slate-500 mt-1">
                                {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Calendar className="mx-auto mb-3" size={48} />
                        <p>No jobs scheduled yet</p>
                        <p className="text-sm mt-1">Use the form to schedule your first job</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="text-gray-600" size={20} />
                  <span>Business Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <Button variant="outline" className="p-4 h-auto justify-start">
                    <div className="text-left">
                      <p className="font-medium">Financial Report</p>
                      <p className="text-sm text-slate-600">Revenue, expenses, and profit analysis</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="p-4 h-auto justify-start">
                    <div className="text-left">
                      <p className="font-medium">Staff Performance</p>
                      <p className="text-sm text-slate-600">Technician productivity and earnings</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="p-4 h-auto justify-start">
                    <div className="text-left">
                      <p className="font-medium">Property Analysis</p>
                      <p className="text-sm text-slate-600">Property performance and revenue tracking</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="text-gray-600" size={20} />
                  <span>System Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-medium text-slate-800 mb-2">User Role Management</h3>
                    <p className="text-sm text-slate-600 mb-3">Configure access permissions for different user roles</p>
                    <Button variant="outline" size="sm">Configure Roles</Button>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-medium text-slate-800 mb-2">Financial Settings</h3>
                    <p className="text-sm text-slate-600 mb-3">Manage pricing, payouts, and billing configurations</p>
                    <Button variant="outline" size="sm">Financial Config</Button>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-medium text-slate-800 mb-2">Integration Settings</h3>
                    <p className="text-sm text-slate-600 mb-3">QuickBooks, payment processing, and third-party integrations</p>
                    <Button variant="outline" size="sm">Manage Integrations</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}