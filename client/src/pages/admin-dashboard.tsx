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
                  <TrendingUp className="text-purple-600" size={16} />
                </div>
                <p className="text-purple-600 text-xs font-medium">Net Profit</p>
                <p className="text-lg font-bold text-purple-700 mt-1" data-testid="stat-net-profit">
                  ${stats?.netProfit?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-purple-600 mt-1">YTD</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="text-amber-600" size={16} />
                </div>
                <p className="text-amber-600 text-xs font-medium">Active Jobs</p>
                <p className="text-lg font-bold text-amber-700 mt-1" data-testid="stat-active-jobs">
                  {stats?.activeJobs || 0}
                </p>
                <p className="text-xs text-amber-600 mt-1">In Progress</p>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Property Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="text-slate-600" size={20} />
              Property Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Properties</span>
                <span className="font-semibold text-slate-900" data-testid="total-properties">
                  {stats?.totalProperties || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Active Properties</span>
                <span className="font-semibold text-green-600" data-testid="active-properties">
                  {stats?.activeProperties || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Avg Revenue/Property</span>
                <span className="font-semibold text-blue-600" data-testid="avg-revenue-property">
                  ${stats?.averageRevenuePerProperty?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="text-green-600" size={20} />
              YTD Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Properties Acquired</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200" data-testid="properties-acquired">
                  +{stats?.propertiesAcquiredYTD || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Properties Lost</span>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200" data-testid="properties-lost">
                  -{stats?.propertiesLostYTD || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Net Growth</span>
                <span className="font-semibold text-green-600" data-testid="net-growth">
                  +{(stats?.propertiesAcquiredYTD || 0) - (stats?.propertiesLostYTD || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="text-blue-600" size={20} />
              Retention Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Turnover Rate</span>
                <span className={`font-semibold ${(stats?.turnoverRate || 0) < 10 ? 'text-green-600' : 'text-amber-600'}`} data-testid="turnover-rate">
                  {stats?.turnoverRate || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Retention Rate</span>
                <span className="font-semibold text-green-600" data-testid="retention-rate">
                  {stats?.propertyRetentionRate || 0}%
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Target: {"<10%"} turnover annually
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Tabs */}
      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="financial" data-testid="tab-financial">Financial</TabsTrigger>
          <TabsTrigger value="schedule" data-testid="tab-schedule">Job Scheduling</TabsTrigger>
          <TabsTrigger value="properties" data-testid="tab-properties">Properties</TabsTrigger>
          <TabsTrigger value="staff" data-testid="tab-staff">Staff Management</TabsTrigger>
          <TabsTrigger value="operations" data-testid="tab-operations">Operations</TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">Reports</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
        </TabsList>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          {/* Financial Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue & Profit Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="text-green-600" size={20} />
                  <span>Financial Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Total Revenue (YTD)</p>
                      <p className="text-xl font-bold text-green-700">$124,750</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">Monthly Avg</p>
                      <p className="text-lg font-semibold text-green-700">$15,594</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Payouts (YTD)</p>
                      <p className="text-xl font-bold text-blue-700">$67,200</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600">Monthly Avg</p>
                      <p className="text-lg font-semibold text-blue-700">$8,400</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Net Profit (YTD)</p>
                      <p className="text-xl font-bold text-purple-700">$57,550</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-purple-600">Profit Margin</p>
                      <p className="text-lg font-semibold text-purple-700">46%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="text-blue-600" size={20} />
                  <span>Property Revenue Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="p-4 border border-slate-100 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-800">Sunset Gardens Apartments</p>
                        <p className="text-sm text-slate-600">142 jobs completed</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">$67,400</p>
                        <p className="text-sm text-slate-500">54% of total</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-slate-100 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-800">Oak Ridge Complex</p>
                        <p className="text-sm text-slate-600">118 jobs completed</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">$57,350</p>
                        <p className="text-sm text-slate-500">46% of total</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Portfolio Performance</span>
                      <span className="font-semibold text-green-700">Excellent</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-slate-600">Average Job Value</span>
                      <span className="font-semibold text-blue-700">$480</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Job Scheduling Tab */}
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
                              {Array.isArray(technicians) ? technicians.map((tech: any) => (
                                <SelectItem key={tech.id} value={tech.id}>
                                  {tech.firstName} {tech.lastName}
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
                      name="scheduledDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scheduled Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              data-testid="input-scheduled-date"
                              {...field} 
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
                          <FormLabel>Job Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the work to be performed..."
                              data-testid="textarea-description"
                              {...field}
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
                  <Badge variant="secondary">{Array.isArray(scheduledJobs) ? scheduledJobs.length : 0}</Badge>
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
                            <p className="font-medium text-slate-800">{job.jobType}</p>
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

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="text-blue-600" size={20} />
                  <span>All Properties - Admin View</span>
                  <Badge variant="secondary">2</Badge>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2" size={16} />
                  Manage Properties
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                {propertiesLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))
                ) : (
                  <>
                    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Sunset Gardens Apartments</p>
                            <p className="text-sm text-slate-600 flex items-center">
                              <MapPin className="mr-1" size={12} />
                              1234 Sunset Blvd, Charlotte, NC 28217
                            </p>
                            <p className="text-sm text-slate-500">24 units • Multi-family • Built 1985</p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div>
                            <p className="text-sm text-slate-500">YTD Work Revenue</p>
                            <p className="text-lg font-bold text-green-600">$67,400</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="text-slate-500">Jobs</p>
                              <p className="font-semibold">142</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Avg Value</p>
                              <p className="font-semibold">$474</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Building className="text-emerald-600" size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Oak Ridge Complex</p>
                            <p className="text-sm text-slate-600 flex items-center">
                              <MapPin className="mr-1" size={12} />
                              456 Oak Avenue, Charlotte, NC 28217
                            </p>
                            <p className="text-sm text-slate-500">36 units • Multi-family • Built 2010</p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div>
                            <p className="text-sm text-slate-500">YTD Work Revenue</p>
                            <p className="text-lg font-bold text-green-600">$57,350</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="text-slate-500">Jobs</p>
                              <p className="font-semibold">118</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Avg Value</p>
                              <p className="font-semibold">$486</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Management Tab */}
        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="text-blue-600" size={20} />
                  <span>Staff Overview</span>
                  <Badge variant="secondary">{stats?.totalStaff || 6}</Badge>
                </div>
                <Button variant="outline" size="sm">
                  <UserCheck className="mr-2" size={16} />
                  Manage Permissions
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Property Managers */}
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Home className="text-blue-600" size={20} />
                    </div>
                    <p className="font-medium text-blue-800">Property Managers</p>
                    <p className="text-2xl font-bold text-blue-900">2</p>
                    <p className="text-xs text-blue-600 mt-1">View & monitor jobs</p>
                  </div>
                </div>

                {/* Office Staff */}
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <FileText className="text-green-600" size={20} />
                    </div>
                    <p className="font-medium text-green-800">Office Staff</p>
                    <p className="text-2xl font-bold text-green-900">2</p>
                    <p className="text-xs text-green-600 mt-1">Assign jobs & operations</p>
                  </div>
                </div>

                {/* Technicians */}
                <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-amber-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Wrench className="text-amber-600" size={20} />
                    </div>
                    <p className="font-medium text-amber-800">Technicians</p>
                    <p className="text-2xl font-bold text-amber-900">8</p>
                    <p className="text-xs text-amber-600 mt-1">Execute work orders</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="text-amber-600" size={20} />
                  <span>Current Operations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-blue-800">Jobs Scheduled</span>
                    <Badge className="bg-blue-200 text-blue-800">15</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                    <span className="font-medium text-amber-800">Jobs In Progress</span>
                    <Badge className="bg-amber-200 text-amber-800">12</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-green-800">Jobs Completed Today</span>
                    <Badge className="bg-green-200 text-green-800">8</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="text-red-600" size={20} />
                  <span>Attention Required</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium text-red-800">High Priority Jobs</span>
                    <Badge className="bg-red-200 text-red-800">3</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium text-yellow-800">Pending Approvals</span>
                    <Badge className="bg-yellow-200 text-yellow-800">5</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium text-purple-800">Photo Requirements</span>
                    <Badge className="bg-purple-200 text-purple-800">2</Badge>
                  </div>
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
                <FileText className="text-green-600" size={20} />
                <span>Business Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="p-4 h-auto justify-start">
                  <div className="text-left">
                    <p className="font-medium">Monthly Financial Report</p>
                    <p className="text-sm text-slate-600">Revenue, expenses, and profit analysis</p>
                  </div>
                </Button>
                <Button variant="outline" className="p-4 h-auto justify-start">
                  <div className="text-left">
                    <p className="font-medium">Property Performance Report</p>
                    <p className="text-sm text-slate-600">Job completion and revenue by property</p>
                  </div>
                </Button>
                <Button variant="outline" className="p-4 h-auto justify-start">
                  <div className="text-left">
                    <p className="font-medium">Technician Performance Report</p>
                    <p className="text-sm text-slate-600">Individual productivity and payouts</p>
                  </div>
                </Button>
                <Button variant="outline" className="p-4 h-auto justify-start">
                  <div className="text-left">
                    <p className="font-medium">Year-to-Date Summary</p>
                    <p className="text-sm text-slate-600">Complete business overview</p>
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
  );
}