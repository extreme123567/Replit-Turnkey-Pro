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
} from "lucide-react";

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

      {/* Main Content Area with bottom padding for fixed tabs */}
      <div className="px-4 py-4 pb-24">
        <Tabs defaultValue="overview" className="w-full">
          {/* Mobile Tab Navigation - Top */}
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
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-0">
            {/* Quick Stats Cards */}
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

            {/* Property Performance Section */}
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

          {/* Job Scheduling Tab */}
          <TabsContent value="schedule" className="space-y-4 mt-0">
            {/* Quick Action Button */}
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-md">
              <CardContent className="p-4">
                <div className="text-center text-white">
                  <Plus className="mx-auto mb-2" size={24} />
                  <p className="text-sm font-medium mb-1">Create New Job</p>
                  <p className="text-xs opacity-75">Schedule work orders and assign technicians</p>
                </div>
              </CardContent>
            </Card>

            {/* Schedule New Job Form */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Calendar className="text-blue-600" size={18} />
                  <span>Job Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Form {...jobForm}>
                  <form onSubmit={jobForm.handleSubmit((data) => createJobMutation.mutate(data))} className="space-y-4">
                    <div className="space-y-4">
                      <FormField
                        control={jobForm.control}
                        name="jobType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cleaning">Cleaning</SelectItem>
                                <SelectItem value="painting">Painting</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="inspection">Inspection</SelectItem>
                                <SelectItem value="repair">Repair</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={jobForm.control}
                        name="propertyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(properties as any[])?.map((property: any) => (
                                  <SelectItem key={property.id} value={property.id}>
                                    {property.name}
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
                        name="assignedTechnicianId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assign Technician</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select technician" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {technicians?.map((tech: any) => (
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

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={jobForm.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
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

                        <FormField
                          control={jobForm.control}
                          name="scheduledDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <FormControl>
                                <Input 
                                  type="datetime-local" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={jobForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the work to be performed..."
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
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Recent Jobs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800">Recent Jobs</h2>
                <Button variant="ghost" size="sm" className="text-blue-600 text-xs">View All</Button>
              </div>
              
              <div className="space-y-2">
                {(scheduledJobs as any[])?.slice(0, 3).map((job: any) => (
                  <Card key={job.id} className="shadow-sm border-0">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                            <Calendar className="text-blue-600" size={14} />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-800">{job.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{job.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs px-2 py-0">
                                {job.priority}
                              </Badge>
                              <span className="text-xs text-slate-400">
                                {new Date(job.scheduledDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!(scheduledJobs as any[])?.length && (
                  <Card className="shadow-sm border-0">
                    <CardContent className="p-6 text-center">
                      <Calendar className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-sm text-gray-500">No jobs scheduled yet</p>
                      <p className="text-xs text-gray-400 mt-1">Create your first job above</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-4 mt-0">
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="text-blue-600" size={20} />
                Team Members
              </h2>
              
              <div className="space-y-2">
                {(staff as any[])?.map((member: any) => (
                  <Card key={member.id} className="shadow-sm border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                          <span className="text-blue-700 font-bold text-sm">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-sm text-slate-800">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-xs text-slate-500 capitalize">{member.role}</p>
                            </div>
                            <div className="text-right">
                              <Badge 
                                variant="outline" 
                                className={`text-xs px-2 py-0 ${
                                  member.status === 'active' 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                              >
                                {member.status}
                              </Badge>
                              <p className="text-xs text-green-600 mt-1 font-medium">
                                ${member.hourlyRate}/hr
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{member.department}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!(staff as any[])?.length && (
                  <Card className="shadow-sm border-0">
                    <CardContent className="p-6 text-center">
                      <Users className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-sm text-gray-500">No staff members found</p>
                      <p className="text-xs text-gray-400 mt-1">Add team members to get started</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 mt-0">
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings className="text-blue-600" size={20} />
                Settings
              </h2>
              
              <div className="space-y-2">
                <Card className="shadow-sm border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Building className="text-blue-600" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-800">Business Information</p>
                        <p className="text-xs text-slate-500 mt-0.5">Company details and branding</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Users className="text-purple-600" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-800">User Management</p>
                        <p className="text-xs text-slate-500 mt-0.5">Add and manage team accounts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="text-green-600" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-800">Billing & Payments</p>
                        <p className="text-xs text-slate-500 mt-0.5">Payment processing and invoices</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <BarChart3 className="text-orange-600" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-800">Reports & Analytics</p>
                        <p className="text-xs text-slate-500 mt-0.5">Business insights and data</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}