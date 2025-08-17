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
  const technicians = staff?.filter((member: any) => member.role === 'technician') || [];

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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-600">ServicePro Management</p>
          </div>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs px-2 py-1">
            <Shield className="mr-1" size={10} />
            Admin
          </Badge>
        </div>
      </div>

      <div className="px-4 py-4">
        <Tabs defaultValue="overview" className="w-full">
          {/* Mobile Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="text-xs">
              <BarChart3 size={14} className="mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs">
              <Calendar size={14} className="mr-1" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="staff" className="text-xs">
              <Users size={14} className="mr-1" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings size={14} className="mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Financial Overview Cards - Mobile Optimized */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-2">
                      <DollarSign className="text-green-600" size={16} />
                    </div>
                    <p className="text-green-600 text-xs font-medium">Revenue</p>
                    <p className="text-lg font-bold text-green-700 mt-1">$124,750</p>
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
                    <p className="text-blue-600 text-xs font-medium">Payouts</p>
                    <p className="text-lg font-bold text-blue-700 mt-1">$67,200</p>
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
                    <p className="text-lg font-bold text-purple-700 mt-1">$57,550</p>
                    <p className="text-xs text-purple-600 mt-1">46% Margin</p>
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
                    <p className="text-lg font-bold text-amber-700 mt-1">{scheduledJobs?.length || 0}</p>
                    <p className="text-xs text-amber-600 mt-1">In Progress</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Property Performance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="text-blue-600" size={18} />
                  Property Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border border-slate-100 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">Sunset Gardens</p>
                      <p className="text-xs text-slate-600">142 jobs completed</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">$67,400</p>
                      <p className="text-xs text-slate-500">54%</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border border-slate-100 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">Oak Ridge Complex</p>
                      <p className="text-xs text-slate-600">118 jobs completed</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">$57,350</p>
                      <p className="text-xs text-slate-500">46%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Job Scheduling Tab */}
          <TabsContent value="schedule" className="space-y-4">
            {/* Schedule New Job */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="text-blue-600" size={18} />
                  <span>Schedule New Job</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                                {properties?.map((property: any) => (
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scheduledJobs?.slice(0, 3).map((job: any) => (
                    <div key={job.id} className="p-3 border border-gray-100 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{job.title}</p>
                          <p className="text-xs text-gray-600">{job.description}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {job.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(job.scheduledDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {!scheduledJobs?.length && (
                    <p className="text-center text-gray-500 py-4">No jobs scheduled yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="text-blue-600" size={18} />
                  <span>Staff Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {staff?.map((member: any) => (
                    <div key={member.id} className="p-3 border border-gray-100 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{member.firstName} {member.lastName}</p>
                          <p className="text-xs text-gray-600">{member.role}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {member.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{member.department}</p>
                          <p className="text-xs text-green-600">${member.hourlyRate}/hr</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!staff?.length && (
                    <p className="text-center text-gray-500 py-4">No staff members found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="text-blue-600" size={18} />
                  <span>System Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border border-gray-100 rounded-lg">
                    <p className="font-medium text-sm">Business Information</p>
                    <p className="text-xs text-gray-600 mt-1">Update company details and settings</p>
                  </div>
                  
                  <div className="p-3 border border-gray-100 rounded-lg">
                    <p className="font-medium text-sm">User Management</p>
                    <p className="text-xs text-gray-600 mt-1">Create and manage user accounts</p>
                  </div>
                  
                  <div className="p-3 border border-gray-100 rounded-lg">
                    <p className="font-medium text-sm">Billing & Payments</p>
                    <p className="text-xs text-gray-600 mt-1">Configure payment processing</p>
                  </div>
                  
                  <div className="p-3 border border-gray-100 rounded-lg">
                    <p className="font-medium text-sm">System Reports</p>
                    <p className="text-xs text-gray-600 mt-1">Generate business reports</p>
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