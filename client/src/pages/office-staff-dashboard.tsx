import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  Send,
  UserCheck,
  Plus,
  Eye,
  Phone,
  TrendingUp,

  ArrowRight,
  Settings,
  Check,
  X,
  Wrench,
  Mail,
  Home,
  Trash2,
  MapPin,
  MessageSquare,
  User,
  Edit,
  UserPlus,
  Save
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ImageGallery } from "@/components/image-editor/ImageGallery";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface OfficeStats {
  pendingApproval: number;
  highPriorityOrders: number;
  leaseExpirations: number;
  activeStaff: number;
  totalProperties: number;
  totalTenants: number;
}

// Job editing form schema
const editJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.string().min(1, "Priority is required"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  assignedTechnicianId: z.string().optional(),
  propertyId: z.string().min(1, "Property is required"),
  unitNumber: z.string().optional(),
  estimatedCost: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  jobType: z.string().optional(),
});

type EditJobFormData = z.infer<typeof editJobSchema>;

// Team assignment form schema
const assignTeamSchema = z.object({
  assignedTechnicianId: z.string().min(1, "Please select a team member"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  notes: z.string().optional(),
});

type AssignTeamFormData = z.infer<typeof assignTeamSchema>;

// Edit Job Dialog Component
function EditJobDialog({ job, onJobUpdated }: { job: any; onJobUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const editForm = useForm<EditJobFormData>({
    resolver: zodResolver(editJobSchema),
    defaultValues: {
      title: job?.title || "",
      description: job?.description || "",
      priority: job?.priority || "medium",
      scheduledDate: job?.scheduledDate ? new Date(job.scheduledDate).toISOString().split('T')[0] : "",
      assignedTechnicianId: job?.assignedTechnicianId || "unassigned",
      propertyId: job?.propertyId || "",
      unitNumber: job?.unitNumber || "",
      estimatedCost: job?.estimatedCost || "",
      category: job?.category || "maintenance",
      jobType: job?.jobType || "",
    },
  });

  const { data: properties } = useQuery({ queryKey: ["/api/properties"] });
  const { data: staff } = useQuery({ queryKey: ["/api/staff"] });

  const updateJobMutation = useMutation({
    mutationFn: async (data: EditJobFormData) => {
      return apiRequest(`/api/work-orders/${job.id}`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Job updated successfully",
        description: "The job details have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      onJobUpdated();
      setOpen(false);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update job",
        description: error.message || "Please check your input and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditJobFormData) => {
    updateJobMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
          <Edit size={16} className="mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Job Details</DialogTitle>
          <DialogDescription>
            Update job information and assignment details.
          </DialogDescription>
        </DialogHeader>
        <Form {...editForm}>
          <form onSubmit={editForm.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="inspection">Inspection</SelectItem>
                        <SelectItem value="tenant_request">Tenant Request</SelectItem>
                        <SelectItem value="extra_dirty">Extra Dirty</SelectItem>
                        <SelectItem value="repair">Repair</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={editForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter job description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={editForm.control}
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
                control={editForm.control}
                name="unitNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={editForm.control}
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
                control={editForm.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={editForm.control}
              name="assignedTechnicianId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Technician</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select technician" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {(staff as any[])?.filter(member => member.role === 'technician').map((technician: any) => (
                        <SelectItem key={technician.id} value={technician.id}>
                          {technician.firstName} {technician.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateJobMutation.isPending}>
                <Save size={16} className="mr-2" />
                {updateJobMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Assign Team Member Dialog Component
function AssignTeamDialog({ job, onJobUpdated }: { job: any; onJobUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const assignForm = useForm<AssignTeamFormData>({
    resolver: zodResolver(assignTeamSchema),
    defaultValues: {
      assignedTechnicianId: job?.assignedTechnicianId || "unassigned",
      scheduledDate: job?.scheduledDate ? new Date(job.scheduledDate).toISOString().split('T')[0] : "",
      notes: "",
    },
  });

  const { data: staff } = useQuery({ queryKey: ["/api/staff"] });

  const assignTeamMutation = useMutation({
    mutationFn: async (data: AssignTeamFormData) => {
      return apiRequest(`/api/work-orders/${job.id}/assign`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Team member assigned successfully",
        description: "The job has been assigned to the selected team member.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      onJobUpdated();
      setOpen(false);
      assignForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to assign team member",
        description: error.message || "Please check your selection and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AssignTeamFormData) => {
    assignTeamMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-800">
          <UserPlus size={16} className="mr-1" />
          Assign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Team Member</DialogTitle>
          <DialogDescription>
            Assign this job to a team member and set the schedule.
          </DialogDescription>
        </DialogHeader>
        <Form {...assignForm}>
          <form onSubmit={assignForm.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={assignForm.control}
              name="assignedTechnicianId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Team Member</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a team member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(staff as any[])?.filter(member => 
                        member.role === 'technician' || member.role === 'inspector'
                      ).map((member: any) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.firstName} {member.lastName} ({member.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={assignForm.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={assignForm.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any special instructions or notes for the team member..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={assignTeamMutation.isPending}>
                <UserPlus size={16} className="mr-2" />
                {assignTeamMutation.isPending ? "Assigning..." : "Assign Team Member"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Scheduled Jobs List Component
function ScheduledJobsList() {
  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = useQuery({ 
    queryKey: ["/api/work-orders"] 
  });
  const { data: properties } = useQuery({ queryKey: ["/api/properties"] });
  const { data: staff } = useQuery({ queryKey: ["/api/staff"] });

  const handleJobUpdated = () => {
    refetchJobs();
  };

  const getPropertyName = (propertyId: string) => {
    const property = (properties as any[])?.find(p => p.id === propertyId);
    return property?.name || 'Unknown Property';
  };

  const getAssignedTechnician = (technicianId: string) => {
    const technician = (staff as any[])?.find(s => s.id === technicianId);
    return technician ? `${technician.firstName} ${technician.lastName}` : 'Unassigned';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getBedroomSizeDisplay = (bedroomSize: string) => {
    if (!bedroomSize) return null;
    const sizeMap: Record<string, string> = {
      'studio': 'Studio',
      '1_bed': '1BR',
      '2_bed': '2BR',
      '3_bed': '3BR',
      'loft': 'Loft',
      '1_bed_townhome': '1BR Townhome',
      '2_bed_townhome': '2BR Townhome',
      '3_bed_townhome': '3BR Townhome'
    };
    return sizeMap[bedroomSize] || bedroomSize;
  };

  if (jobsLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const scheduledJobs = (jobs as any[])?.filter(job => 
    job.status === 'scheduled' || job.status === 'in_progress'
  ) || [];

  if (scheduledJobs.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No scheduled jobs</h3>
        <p className="mt-1 text-sm text-gray-500">
          All jobs are completed or no jobs have been scheduled yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {scheduledJobs.map((job: any) => (
        <div 
          key={job.id} 
          className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
          data-testid={`job-card-${job.id}`}
        >
          {/* Header with title, badges and actions */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Title and badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h3 className="font-medium text-slate-900 text-base">{job.title}</h3>
                <Badge className={`text-xs ${getPriorityColor(job.priority)}`}>
                  {job.priority}
                </Badge>
                <Badge className={`text-xs ${getStatusColor(job.status)}`}>
                  {job.status.replace('_', ' ')}
                </Badge>
                {job.bedroomSize && (
                  <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                    {getBedroomSizeDisplay(job.bedroomSize)}
                  </Badge>
                )}
              </div>
              
              {/* Job details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-sm text-slate-600 mb-3">
                <div className="flex items-center min-w-0">
                  <Building className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {getPropertyName(job.propertyId)}
                    {job.unitNumber && ` - Unit ${job.unitNumber}`}
                  </span>
                </div>
                <div className="flex items-center min-w-0">
                  <User className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{getAssignedTechnician(job.assignedTechnicianId)}</span>
                </div>
                <div className="flex items-center min-w-0">
                  <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                  </span>
                </div>
                <div className="flex items-center min-w-0">
                  <DollarSign className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{job.estimatedCost ? `$${job.estimatedCost}` : 'No estimate'}</span>
                </div>
              </div>
              
              {/* Description */}
              {job.description && (
                <p className="text-sm text-slate-500 line-clamp-2">
                  {job.description}
                </p>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <EditJobDialog job={job} onJobUpdated={handleJobUpdated} />
              <AssignTeamDialog job={job} onJobUpdated={handleJobUpdated} />
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                <Eye size={16} className="mr-1" />
                View
              </Button>
            </div>
          </div>
        </div>
      ))}
      
      {/* Summary Stats */}
      <div className="pt-6 border-t border-slate-200 mt-6">
        <h4 className="text-sm font-medium text-slate-700 mb-4">Job Summary</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {scheduledJobs.filter(j => j.status === 'scheduled').length}
            </p>
            <p className="text-sm text-slate-600 mt-1">Scheduled</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">
              {scheduledJobs.filter(j => j.status === 'in_progress').length}
            </p>
            <p className="text-sm text-slate-600 mt-1">In Progress</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {scheduledJobs.filter(j => j.priority === 'high' || j.priority === 'emergency').length}
            </p>
            <p className="text-sm text-slate-600 mt-1">High Priority</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-600">
              {scheduledJobs.filter(j => !j.assignedTechnicianId).length}
            </p>
            <p className="text-sm text-slate-600 mt-1">Unassigned</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Request Quote Button Component
function RequestQuoteButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [property, setProperty] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [category, setCategory] = useState("maintenance");
  const [priority, setPriority] = useState("medium");
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [preferredStartDate, setPreferredStartDate] = useState("");
  const [preferredEndDate, setPreferredEndDate] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      return apiRequest("/api/quote-requests", "POST", quoteData);
    },
    onSuccess: () => {
      toast({
        title: "Quote Request Submitted",
        description: "Your quote request has been sent to the office.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quote-requests"] });
      setOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setProperty("");
      setUnitNumber("");
      setCategory("maintenance");
      setPriority("medium");
      setEstimatedBudget("");
      setPreferredStartDate("");
      setPreferredEndDate("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit quote request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitQuote = () => {
    if (!title || !description || !property) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    submitQuoteMutation.mutate({
      title,
      description,
      property,
      unitNumber,
      category,
      priority,
      estimatedBudget,
      preferredStartDate,
      preferredEndDate,
      requestedBy: "office-staff"
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-request-quote">
          <DollarSign className="mr-2 h-4 w-4" />
          Request Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request Quote from Office</DialogTitle>
          <DialogDescription>
            Submit a detailed quote request for approval and pricing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="quote-title">Service Title *</Label>
            <Input
              id="quote-title"
              placeholder="e.g., Kitchen renovation - Unit 205"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-quote-title"
            />
          </div>
          
          <div>
            <Label htmlFor="quote-description">Detailed Description *</Label>
            <Textarea
              id="quote-description"
              placeholder="Describe the work needed in detail..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="textarea-quote-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="property">Property *</Label>
              <Select value={property} onValueChange={setProperty}>
                <SelectTrigger data-testid="select-quote-property">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maple-gardens">Maple Gardens</SelectItem>
                  <SelectItem value="oak-village">Oak Village</SelectItem>
                  <SelectItem value="pine-heights">Pine Heights</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="unit-number">Unit Number / Common Area Space</Label>
              <Input
                id="unit-number"
                placeholder="e.g., 205, Lobby, Pool Area, Gym"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                data-testid="input-quote-unit-number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-quote-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="renovation">Renovation</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger data-testid="select-quote-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="estimated-budget">Estimated Budget</Label>
            <Input
              id="estimated-budget"
              placeholder="e.g., $1,500"
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(e.target.value)}
              data-testid="input-estimated-budget"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preferred-start-date">Preferred Start Date</Label>
              <Input
                id="preferred-start-date"
                type="date"
                value={preferredStartDate}
                onChange={(e) => setPreferredStartDate(e.target.value)}
                data-testid="input-preferred-start-date"
              />
            </div>
            <div>
              <Label htmlFor="preferred-end-date">Preferred End Date</Label>
              <Input
                id="preferred-end-date"
                type="date"
                value={preferredEndDate}
                onChange={(e) => setPreferredEndDate(e.target.value)}
                data-testid="input-preferred-end-date"
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitQuote}
              disabled={submitQuoteMutation.isPending}
              className="flex-1"
              data-testid="button-submit-quote"
            >
              {submitQuoteMutation.isPending ? "Submitting..." : "Submit Quote Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



// Multi-Job Scheduling Component
function ScheduleJobsSection() {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      type: 'Paint',
      property: 'Sunset Gardens Apt 102B',
      unit: '102B',
      scheduledDate: '2024-08-18',
      completionDate: '2024-08-20',
      priority: 'medium',
      status: 'scheduled',
      poNumber: 'PO-2024-001'
    },
    {
      id: 2,
      type: 'Clean',
      property: 'Oak Ridge Complex 205A',
      unit: '205A',
      scheduledDate: '2024-08-19',
      completionDate: '2024-08-19',
      priority: 'high',
      status: 'in_progress',
      poNumber: 'PO-2024-002'
    }
  ]);

  const removeJob = (jobId: number) => {
    setJobs(jobs.filter(job => job.id !== jobId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-amber-600 bg-amber-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      case 'emergency': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-lg">{job.type} - {job.property}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                    {job.priority.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Unit:</span> {job.unit}
                  </div>
                  <div>
                    <span className="font-medium">Scheduled:</span> {job.scheduledDate}
                  </div>
                  <div>
                    <span className="font-medium">Target:</span> {job.completionDate || 'TBD'}
                  </div>
                  <div>
                    <span className="font-medium">PO#:</span> {job.poNumber || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeJob(job.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  data-testid={`button-remove-job-${job.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No jobs scheduled.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Units Completed Widget - Shows total units turned and callbacks scheduled
function UnitsCompletedWidget() {
  const [unitsCompleted, setUnitsCompleted] = useState(147); // Example starting count
  const [callbacksScheduled, setCallbacksScheduled] = useState(23); // Example starting count
  
  const incrementUnits = () => {
    setUnitsCompleted(prev => prev + 1);
  };

  const incrementCallbacks = () => {
    setCallbacksScheduled(prev => prev + 1);
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 min-w-[280px]">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Units Turned Section */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-medium">Units Turned</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1" data-testid="units-completed-count">
                {unitsCompleted}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center">
                <Home className="text-emerald-600" size={14} />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={incrementUnits}
                className="text-xs px-2 py-1 h-6 bg-emerald-50 border-emerald-300 hover:bg-emerald-100"
                data-testid="button-add-completed-unit"
              >
                +1
              </Button>
            </div>
          </div>
          
          {/* Callbacks Scheduled Section */}
          <div className="flex items-center justify-between border-t border-emerald-200 pt-3">
            <div>
              <p className="text-emerald-600 text-sm font-medium">Callbacks Scheduled</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1" data-testid="callbacks-scheduled-count">
                {callbacksScheduled}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center">
                <ArrowRight className="text-emerald-600" size={14} />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={incrementCallbacks}
                className="text-xs px-2 py-1 h-6 bg-emerald-50 border-emerald-300 hover:bg-emerald-100"
                data-testid="button-add-scheduled-callback"
              >
                +1
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OfficeStaffDashboard() {
  const { toast } = useToast();
  
  // Modal states
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isScheduleJobModalOpen, setIsScheduleJobModalOpen] = useState(false);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Form states
  const [quoteForm, setQuoteForm] = useState({
    title: '',
    description: '',
    propertyId: '',
    unitNumber: '',
    category: 'apartment-turn',
    priority: 'medium'
  });

  const [scheduleJobsForm, setScheduleJobsForm] = useState({
    jobs: [{
      description: '',
      propertyId: '',
      unitNumber: '',
      jobType: 'maintenance',
      category: 'maintenance',
      priority: 'medium',
      bedroomSize: '',
      scheduledDate: '',
      estimatedCost: '',
      notes: ''
    }]
  });

  const { data: stats, isLoading: statsLoading } = useQuery<OfficeStats>({
    queryKey: ["/api/dashboard/office"],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/office');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  // Financial access removed for Office Staff - Admin only

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

  // Search completed units query
  const { data: completedUnits, isLoading: searchLoading } = useQuery({
    queryKey: ['/api/units/completed', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(`/api/units/search/completed?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Failed to search completed units');
      return response.json();
    },
    enabled: searchQuery.trim().length > 0,
  });

  // Quote requests query
  const { data: quoteRequests = [], isLoading: quotesLoading, refetch: refetchQuotes } = useQuery({
    queryKey: ['/api/quote-requests'],
    queryFn: async () => {
      const response = await fetch('/api/quote-requests');
      if (!response.ok) throw new Error('Failed to fetch quote requests');
      return response.json();
    },
  });

  // Submit quote request
  const handleSubmitQuote = async () => {
    try {
      if (!quoteForm.title || !quoteForm.description || !quoteForm.propertyId) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...quoteForm,
          requesterId: 'office-staff-1', // This would come from auth context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create quote request');
      }

      // Reset form and close modal
      setQuoteForm({
        title: '',
        description: '',
        propertyId: '',
        unitNumber: '',
        category: 'apartment-turn',
        priority: 'medium'
      });
      setIsQuoteModalOpen(false);
      
      // Refresh quote requests
      refetchQuotes();
      
      alert('Quote sent successfully!');
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('Failed to send quote. Please try again.');
    }
  };

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800" data-testid="text-office-dashboard-title">
            Office Staff Dashboard
          </h2>
          <p className="text-slate-600">Welcome back, John Smith</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={isScheduleJobModalOpen} onOpenChange={setIsScheduleJobModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-schedule-job">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Jobs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Jobs</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Jobs to Schedule ({scheduleJobsForm.jobs.length})</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setScheduleJobsForm({
                      jobs: [...scheduleJobsForm.jobs, {
                        description: '',
                        propertyId: '',
                        unitNumber: '',
                        jobType: 'maintenance',
                        category: 'maintenance',
                        priority: 'medium',
                        bedroomSize: '',
                        scheduledDate: '',
                        estimatedCost: '',
                        notes: ''
                      }]
                    })}
                    data-testid="button-add-job"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Job
                  </Button>
                </div>

                {scheduleJobsForm.jobs.map((job, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4 bg-slate-50">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-slate-800">Job #{index + 1}</h4>
                      {scheduleJobsForm.jobs.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            if (scheduleJobsForm.jobs.length > 1) {
                              const newJobs = scheduleJobsForm.jobs.filter((_, i) => i !== index);
                              setScheduleJobsForm({ jobs: newJobs });
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-remove-job-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Job Type */}
                    <div className="grid gap-2">
                      <Label>Job Type *</Label>
                      <Select 
                        value={job.jobType} 
                        onValueChange={(value) => {
                          const newJobs = [...scheduleJobsForm.jobs];
                          newJobs[index] = { ...newJobs[index], jobType: value };
                          setScheduleJobsForm({ jobs: newJobs });
                        }}
                      >
                        <SelectTrigger data-testid={`select-job-type-${index}`}>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paint">🎨 Paint</SelectItem>
                          <SelectItem value="clean">🧽 Clean</SelectItem>
                          <SelectItem value="maintenance">🔧 Maintenance</SelectItem>
                          <SelectItem value="inspection">👀 Inspection</SelectItem>
                          <SelectItem value="repair">⚒️ Repair</SelectItem>
                          <SelectItem value="carpet">🪟 Carpet Work</SelectItem>
                          <SelectItem value="punch">👊 Punch</SelectItem>
                          <SelectItem value="hvac">❄️ HVAC Services</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Property Information */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label>Property *</Label>
                        <Select 
                          value={job.propertyId} 
                          onValueChange={(value) => {
                            const newJobs = [...scheduleJobsForm.jobs];
                            newJobs[index] = { ...newJobs[index], propertyId: value };
                            setScheduleJobsForm({ jobs: newJobs });
                          }}
                        >
                          <SelectTrigger data-testid={`select-property-${index}`}>
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maple-gardens">Maple Gardens</SelectItem>
                            <SelectItem value="oak-village">Oak Village</SelectItem>
                            <SelectItem value="pine-heights">Pine Heights</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Unit Number *</Label>
                        <Input
                          placeholder="e.g., 205, A12"
                          value={job.unitNumber}
                          onChange={(e) => {
                            const newJobs = [...scheduleJobsForm.jobs];
                            newJobs[index] = { ...newJobs[index], unitNumber: e.target.value };
                            setScheduleJobsForm({ jobs: newJobs });
                          }}
                          data-testid={`input-unit-number-${index}`}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Unit Size</Label>
                        <Select 
                          value={job.bedroomSize} 
                          onValueChange={(value) => {
                            const newJobs = [...scheduleJobsForm.jobs];
                            newJobs[index] = { ...newJobs[index], bedroomSize: value };
                            setScheduleJobsForm({ jobs: newJobs });
                          }}
                        >
                          <SelectTrigger data-testid={`select-bedroom-size-${index}`}>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="studio">Studio</SelectItem>
                            <SelectItem value="1_bed">1 Bedroom</SelectItem>
                            <SelectItem value="2_bed">2 Bedroom</SelectItem>
                            <SelectItem value="3_bed">3 Bedroom</SelectItem>
                            <SelectItem value="loft">Loft</SelectItem>
                            <SelectItem value="1_bed_townhome">1BR Townhome</SelectItem>
                            <SelectItem value="2_bed_townhome">2BR Townhome</SelectItem>
                            <SelectItem value="3_bed_townhome">3BR Townhome</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Scheduling Information */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label>Priority</Label>
                        <Select 
                          value={job.priority} 
                          onValueChange={(value) => {
                            const newJobs = [...scheduleJobsForm.jobs];
                            newJobs[index] = { ...newJobs[index], priority: value };
                            setScheduleJobsForm({ jobs: newJobs });
                          }}
                        >
                          <SelectTrigger data-testid={`select-priority-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">🟢 Low</SelectItem>
                            <SelectItem value="medium">🟡 Medium</SelectItem>
                            <SelectItem value="high">🟠 High</SelectItem>
                            <SelectItem value="emergency">🔴 Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Preferred Date</Label>
                        <Input
                          type="date"
                          value={job.scheduledDate}
                          onChange={(e) => {
                            const newJobs = [...scheduleJobsForm.jobs];
                            newJobs[index] = { ...newJobs[index], scheduledDate: e.target.value };
                            setScheduleJobsForm({ jobs: newJobs });
                          }}
                          data-testid={`input-scheduled-date-${index}`}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Estimated Cost</Label>
                        <Input
                          placeholder="e.g., 150.00"
                          value={job.estimatedCost}
                          onChange={(e) => {
                            const newJobs = [...scheduleJobsForm.jobs];
                            newJobs[index] = { ...newJobs[index], estimatedCost: e.target.value };
                            setScheduleJobsForm({ jobs: newJobs });
                          }}
                          data-testid={`input-estimated-cost-${index}`}
                        />
                      </div>
                    </div>

                    {/* Description and Notes */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe the work..."
                          rows={2}
                          value={job.description}
                          onChange={(e) => {
                            const newJobs = [...scheduleJobsForm.jobs];
                            newJobs[index] = { ...newJobs[index], description: e.target.value };
                            setScheduleJobsForm({ jobs: newJobs });
                          }}
                          data-testid={`textarea-job-description-${index}`}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Additional Notes</Label>
                        <Textarea
                          placeholder="Special instructions..."
                          rows={2}
                          value={job.notes}
                          onChange={(e) => {
                            const newJobs = [...scheduleJobsForm.jobs];
                            newJobs[index] = { ...newJobs[index], notes: e.target.value };
                            setScheduleJobsForm({ jobs: newJobs });
                          }}
                          data-testid={`textarea-job-notes-${index}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsScheduleJobModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={async () => {
                      const invalidJobs = scheduleJobsForm.jobs.filter(job => !job.propertyId || !job.unitNumber);
                      if (invalidJobs.length > 0) {
                        toast({
                          title: "Missing Information",
                          description: "Please fill in property and unit number for all jobs.",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      try {
                        // Submit jobs to API
                        const response = await apiRequest('/api/work-orders/schedule-multiple', {
                          method: 'POST',
                          body: JSON.stringify({
                            jobs: scheduleJobsForm.jobs.map(job => ({
                              ...job,
                              requestedBy: "office-staff",
                              status: 'pending_approval',
                              createdAt: new Date().toISOString()
                            }))
                          })
                        });
                        
                        const data = await response.json();
                        
                        toast({
                          title: "Jobs Scheduled",
                          description: `${scheduleJobsForm.jobs.length} job${scheduleJobsForm.jobs.length > 1 ? 's' : ''} scheduled successfully and sent for approval.`,
                        });
                        
                        // Reset form and close modal
                        setScheduleJobsForm({
                          jobs: [{
                            description: '',
                            propertyId: '',
                            unitNumber: '',
                            jobType: 'maintenance',
                            category: 'maintenance',
                            priority: 'medium',
                            bedroomSize: '',
                            scheduledDate: '',
                            estimatedCost: '',
                            notes: ''
                          }]
                        });
                        setIsScheduleJobModalOpen(false);
                      } catch (error: any) {
                        toast({
                          title: "Scheduling Failed",
                          description: error.message || "Failed to schedule jobs. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={scheduleJobsForm.jobs.some(job => !job.propertyId || !job.unitNumber)}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-submit-schedule"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule {scheduleJobsForm.jobs.length} Job{scheduleJobsForm.jobs.length > 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-send-quote">
                <DollarSign className="mr-2 h-4 w-4" />
                Send Quote
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader className="pb-6">
                <div className="text-center border-b pb-4">
                  <h1 className="text-2xl font-bold text-blue-900">QC APARTMENT TURNS</h1>
                  <p className="text-sm text-gray-600 mt-1">4321 Stuart Andrew Blvd Ste D, Charlotte, NC 28217</p>
                  <DialogTitle className="text-xl font-semibold mt-4 text-gray-800">Send Service Quote</DialogTitle>
                </div>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                {/* Customer Information Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="property">Property/Customer Name</Label>
                      <Select value={quoteForm.propertyId} onValueChange={(value) => setQuoteForm({...quoteForm, propertyId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maple-gardens">Maple Gardens</SelectItem>
                          <SelectItem value="oak-village">Oak Village</SelectItem>
                          <SelectItem value="pine-heights">Pine Heights</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unit-number">Unit Number</Label>
                      <Input
                        id="unit-number"
                        placeholder="e.g., 205"
                        value={quoteForm.unitNumber}
                        onChange={(e) => setQuoteForm({...quoteForm, unitNumber: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Service Details Section */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Service Details</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="quote-title">Service Title</Label>
                      <Input
                        id="quote-title"
                        placeholder="e.g., Kitchen renovation - Unit 205"
                        value={quoteForm.title}
                        onChange={(e) => setQuoteForm({...quoteForm, title: e.target.value})}
                        className="bg-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="quote-description">Detailed Description of Work Needed</Label>
                      <Textarea
                        id="quote-description"
                        placeholder="Please provide a detailed description of the work required, including materials, labor, timeline expectations, and any special requirements..."
                        rows={4}
                        value={quoteForm.description}
                        onChange={(e) => setQuoteForm({...quoteForm, description: e.target.value})}
                        className="bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="category">Service Category</Label>
                        <Select value={quoteForm.category} onValueChange={(value) => setQuoteForm({...quoteForm, category: value})}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="apartment-turn">Apartment Turn</SelectItem>
                            <SelectItem value="painting">Painting</SelectItem>
                            <SelectItem value="cleaning">Deep Cleaning</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="repair">Repair</SelectItem>
                            <SelectItem value="renovation">Renovation</SelectItem>
                            <SelectItem value="flooring">Flooring</SelectItem>
                            <SelectItem value="plumbing">Plumbing</SelectItem>
                            <SelectItem value="electrical">Electrical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="priority">Priority Level</Label>
                        <Select value={quoteForm.priority} onValueChange={(value) => setQuoteForm({...quoteForm, priority: value})}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low - Routine Work</SelectItem>
                            <SelectItem value="medium">Medium - Standard Timeline</SelectItem>
                            <SelectItem value="high">High - Urgent</SelectItem>
                            <SelectItem value="emergency">Emergency - ASAP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Additional Information</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    We specialize in apartment turns, painting, cleaning, and maintenance services. Our team provides professional, efficient service with competitive pricing.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Services Include:</strong>
                      <ul className="list-disc list-inside mt-1 text-gray-600">
                        <li>Complete apartment turns</li>
                        <li>Interior/exterior painting</li>
                        <li>Deep cleaning services</li>
                        <li>Maintenance and repairs</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Contact Information:</strong>
                      <p className="text-gray-600 mt-1">
                        4321 Stuart Andrew Blvd Ste D<br/>
                        Charlotte, NC 28217
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    All quote requests will be reviewed within 24 hours
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => setIsQuoteModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6" 
                      onClick={handleSubmitQuote}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Send Quote
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          

          <Button variant="outline" className="flex items-center space-x-2">
            <CheckCircle className="mr-2 h-4 w-4" />
            Units Turned
            <Badge variant="secondary" className="ml-2">147</Badge>
          </Button>

          <Button variant="outline" className="flex items-center space-x-2" data-testid="button-track-callbacks">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Track Callbacks
            <Badge variant="secondary" className="ml-2">12</Badge>
          </Button>
        </div>
      </div>

      {/* Key Metrics - Job Status & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>

      {/* Search Completed Units Section */}
      <Card className="servicepro-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Search Completed Units</span>
            <Badge variant="outline" className="text-green-600">
              Work History
            </Badge>
          </CardTitle>
          <div className="text-sm text-slate-600">
            Search completed work orders by property name and unit number only
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by property name and unit number only..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.trim().length > 0);
                }}
                className="w-full"
                data-testid="input-search-completed-office"
              />
            </div>
            <Button 
              onClick={() => setShowSearchResults(true)}
              disabled={!searchQuery.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-search-completed-office"
            >
              <Eye className="mr-2" size={16} />
              Search
            </Button>
          </div>

          {/* Search Results */}
          {showSearchResults && searchQuery.trim() && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Search Results</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowSearchResults(false);
                    setSearchQuery("");
                  }}
                  data-testid="button-clear-search-office"
                >
                  <X className="mr-1" size={14} />
                  Clear
                </Button>
              </div>

              {searchLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : completedUnits?.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {completedUnits.map((unit: any) => (
                    <div key={unit.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="text-green-600" size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{unit.title || `${unit.jobType} - ${unit.unit}`}</p>
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <span className="flex items-center">
                                <Building className="mr-1" size={12} />
                                {unit.property}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="mr-1" size={12} />
                                {unit.unit}
                              </span>
                              <span className="flex items-center">
                                <UserCheck className="mr-1" size={12} />
                                {unit.technician || unit.technicianName}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Completed: {new Date(unit.completedAt || unit.completedDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {unit.status || 'Completed'}
                          </Badge>
                          {unit.bedroomSize && (
                            <div>
                              <Badge variant="outline" className="bg-purple-100 text-purple-700 text-xs">
                                {unit.bedroomSize}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p>No completed units found matching "{searchQuery}"</p>
                  <p className="text-sm">Try a different search term or check the spelling</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="inline-flex h-12 items-center justify-start rounded-xl bg-gray-100 p-1 text-muted-foreground mb-8 gap-1 w-full overflow-x-auto">
          <TabsTrigger 
            value="overview" 
            data-testid="tab-overview"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm min-w-fit"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="quotes" 
            data-testid="tab-quotes"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm min-w-fit"
          >
            Quotes
          </TabsTrigger>
          <TabsTrigger 
            value="jobs" 
            data-testid="tab-jobs"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm min-w-fit"
          >
            Job Approvals
          </TabsTrigger>
          <TabsTrigger 
            value="staff" 
            data-testid="tab-staff"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm min-w-fit"
          >
            Staff Management
          </TabsTrigger>
          <TabsTrigger 
            value="messaging" 
            data-testid="tab-messaging"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm min-w-fit"
          >
            Messaging
          </TabsTrigger>
          <TabsTrigger 
            value="callbacks" 
            data-testid="tab-callbacks"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm min-w-fit"
          >
            Callbacks
          </TabsTrigger>
          <TabsTrigger 
            value="billing" 
            data-testid="tab-billing"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm min-w-fit"
          >
            Billing
          </TabsTrigger>

        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">

          {/* Job Scheduling Section */}
          <ScheduleJobsSection />

          {/* Job Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Scheduled Jobs</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1" data-testid="stat-scheduled-jobs">
                      3
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                    <Calendar className="text-blue-600" size={20} />
                  </div>
                </div>
                <p className="text-sm text-blue-600 mt-2">Ready to start</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-sm font-medium">In Progress</p>
                    <p className="text-2xl font-bold text-amber-700 mt-1" data-testid="stat-in-progress-jobs">
                      4
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-200 rounded-lg flex items-center justify-center">
                    <Clock className="text-amber-600" size={20} />
                  </div>
                </div>
                <p className="text-sm text-amber-600 mt-2">Currently active</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Completed Today</p>
                    <p className="text-2xl font-bold text-green-700 mt-1" data-testid="stat-completed-jobs">
                      6
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={20} />
                  </div>
                </div>
                <p className="text-sm text-green-600 mt-2">Tasks finished</p>
              </CardContent>
            </Card>
          </div>

          {/* Properties List with Revenue Tracking */}
          <Card className="servicepro-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="text-blue-600" size={20} />
                  <span>Property Portfolio</span>
                  <Badge variant="secondary" className="ml-2">
                    2
                  </Badge>
                </div>
                <div className="text-right text-sm">
                  <p className="text-slate-600">Total Work Revenue (YTD)</p>
                  <p className="text-lg font-bold text-green-600">
                    $124,750
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                {/* Sunset Gardens Property */}
                <div className="p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" data-testid="property-sunset-gardens">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="text-blue-600 text-sm" size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Sunset Gardens Apartments</p>
                        <p className="text-sm text-slate-600 flex items-center">
                          <MapPin className="mr-1" size={12} />
                          Charlotte, NC
                        </p>
                        <p className="text-xs text-slate-500">24 units • 22 occupied</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-3">
                        <div className="text-center">
                          <p className="text-xs text-slate-500">Work Revenue (YTD)</p>
                          <p className="text-sm font-bold text-green-600">
                            $67,400
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500">Jobs Completed</p>
                          <p className="text-sm font-medium text-blue-600">
                            142
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-1.5 w-16">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{width: "74%"}}
                          />
                        </div>
                        <span className="text-xs text-slate-600 font-medium">$474 avg</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Oak Ridge Complex Property */}
                <div className="p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" data-testid="property-oak-ridge">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Building className="text-emerald-600 text-sm" size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Oak Ridge Complex</p>
                        <p className="text-sm text-slate-600 flex items-center">
                          <MapPin className="mr-1" size={12} />
                          Charlotte, NC
                        </p>
                        <p className="text-xs text-slate-500">36 units • 34 occupied</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-3">
                        <div className="text-center">
                          <p className="text-xs text-slate-500">Work Revenue (YTD)</p>
                          <p className="text-sm font-bold text-green-600">
                            $57,350
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500">Jobs Completed</p>
                          <p className="text-sm font-medium text-blue-600">
                            118
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-1.5 w-16">
                          <div 
                            className="bg-emerald-500 h-1.5 rounded-full" 
                            style={{width: "62%"}}
                          />
                        </div>
                        <span className="text-xs text-slate-600 font-medium">$486 avg</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Revenue Summary */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-4 text-center text-xs">
                    <div>
                      <p className="text-slate-500">Total Jobs</p>
                      <p className="font-semibold text-blue-700">260</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Avg Job Value</p>
                      <p className="font-semibold text-green-700">$480</p>
                    </div>
                    <div>
                      <p className="text-slate-500">YTD Work Revenue</p>
                      <p className="font-semibold text-green-700">$124,750</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color-Coded Job Calendar - Full width */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="text-blue-500" size={20} />
                <span>Job Schedule Calendar</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-6">
                {/* Calendar Legend */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Paint</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Clean</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-black rounded"></div>
                    <span>Punch</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>Carpet</span>
                  </div>
                </div>

                {/* Larger Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 text-center">
                  {/* Calendar Headers */}
                  <div className="text-sm font-medium text-gray-500 p-2">Sun</div>
                  <div className="text-sm font-medium text-gray-500 p-2">Mon</div>
                  <div className="text-sm font-medium text-gray-500 p-2">Tue</div>
                  <div className="text-sm font-medium text-gray-500 p-2">Wed</div>
                  <div className="text-sm font-medium text-gray-500 p-2">Thu</div>
                  <div className="text-sm font-medium text-gray-500 p-2">Fri</div>
                  <div className="text-sm font-medium text-gray-500 p-2">Sat</div>

                  {/* Calendar Days with Sample Jobs - Larger cells */}
                  <div className="p-2"></div>
                  <div className="p-2"></div>
                  <div className="p-2"></div>
                  <div className="p-3 border rounded-lg min-h-[60px]">
                    <div className="text-sm font-medium">1</div>
                  </div>
                  <div className="p-3 border rounded-lg min-h-[60px]">
                    <div className="text-sm font-medium">2</div>
                    <div className="w-4 h-2 bg-blue-500 rounded mx-auto mt-1"></div>
                  </div>
                  <div className="p-3 border rounded-lg min-h-[60px]">
                    <div className="text-sm font-medium">3</div>
                    <div className="w-4 h-2 bg-red-500 rounded mx-auto mt-1"></div>
                  </div>
                  <div className="p-3 border rounded-lg min-h-[60px]">
                    <div className="text-sm font-medium">4</div>
                  </div>

                  <div className="p-3 border rounded-lg min-h-[60px]">
                    <div className="text-sm font-medium">5</div>
                    <div className="w-4 h-2 bg-black rounded mx-auto mt-1"></div>
                  </div>
                  <div className="p-3 border rounded-lg min-h-[60px]">
                    <div className="text-sm font-medium">6</div>
                    <div className="w-4 h-2 bg-yellow-500 rounded mx-auto mt-1"></div>
                  </div>
                  <div className="p-3 border rounded-lg min-h-[60px]">
                    <div className="text-sm font-medium">7</div>
                    <div className="w-4 h-2 bg-blue-500 rounded mx-auto mt-1"></div>
                  </div>
                  <div className="p-3 border rounded-lg min-h-[60px]">
                    <div className="text-sm font-medium">8</div>
                    <div className="w-4 h-2 bg-red-500 rounded mx-auto mt-1"></div>
                  </div>
                  <div className="p-3 border rounded-lg min-h-[60px] bg-blue-50">
                    <div className="text-sm font-bold">9</div>
                    <div className="flex space-x-1 justify-center mt-1">
                      <div className="w-2 h-2 bg-blue-500 rounded"></div>
                      <div className="w-2 h-2 bg-red-500 rounded"></div>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg min-h-[60px]">
                    <div className="text-sm font-medium">10</div>
                    <div className="w-4 h-2 bg-black rounded mx-auto mt-1"></div>
                  </div>
                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">11</div>
                    </div>

                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">12</div>
                      <div className="w-4 h-2 bg-yellow-500 rounded mx-auto mt-1"></div>
                    </div>
                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">13</div>
                      <div className="w-4 h-2 bg-blue-500 rounded mx-auto mt-1"></div>
                    </div>
                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">14</div>
                      <div className="w-4 h-2 bg-red-500 rounded mx-auto mt-1"></div>
                    </div>
                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">15</div>
                      <div className="w-4 h-2 bg-black rounded mx-auto mt-1"></div>
                    </div>
                    <div className="p-3 border rounded-lg min-h-[60px] bg-green-50">
                      <div className="text-sm font-bold">16</div>
                      <div className="flex space-x-1 justify-center mt-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded"></div>
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded"></div>
                        <div className="w-1.5 h-1.5 bg-red-500 rounded"></div>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">17</div>
                    </div>
                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">18</div>
                    </div>

                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">19</div>
                      <div className="w-4 h-2 bg-black rounded mx-auto mt-1"></div>
                    </div>
                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">20</div>
                      <div className="w-4 h-2 bg-blue-500 rounded mx-auto mt-1"></div>
                    </div>
                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">21</div>
                      <div className="w-4 h-2 bg-red-500 rounded mx-auto mt-1"></div>
                    </div>
                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">22</div>
                      <div className="w-4 h-2 bg-yellow-500 rounded mx-auto mt-1"></div>
                    </div>
                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">23</div>
                      <div className="w-4 h-2 bg-blue-500 rounded mx-auto mt-1"></div>
                    </div>
                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">24</div>
                    </div>
                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">25</div>
                    </div>

                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">26</div>
                      <div className="w-4 h-2 bg-red-500 rounded mx-auto mt-1"></div>
                    </div>
                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">27</div>
                      <div className="w-4 h-2 bg-black rounded mx-auto mt-1"></div>
                    </div>
                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">28</div>
                      <div className="w-4 h-2 bg-yellow-500 rounded mx-auto mt-1"></div>
                    </div>
                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">29</div>
                      <div className="w-4 h-2 bg-blue-500 rounded mx-auto mt-1"></div>
                    </div>
                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">30</div>
                      <div className="w-4 h-2 bg-red-500 rounded mx-auto mt-1"></div>
                    </div>
                    <div className="p-3 border rounded-lg min-h-[60px]">
                      <div className="text-sm font-medium">31</div>
                    </div>
                    <div className="p-2"></div>
                  </div>

                  {/* Today's Job Summary */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-base font-medium text-gray-800 mb-3">Today's Jobs</p>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm">Paint Jobs</span>
                        <span className="font-bold text-lg">2</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="text-sm">Clean Jobs</span>
                        <span className="font-bold text-lg">1</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm">Punch Jobs</span>
                        <span className="font-bold text-lg">0</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm">Carpet Jobs</span>
                        <span className="font-bold text-lg">0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="space-y-6">
          <QuotesSection quoteRequests={quoteRequests} isLoading={quotesLoading} />
        </TabsContent>

        {/* Job Approvals Tab */}
        <TabsContent value="jobs" className="space-y-6">
          {/* Scheduled Jobs Management */}
          <Card className="servicepro-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="text-blue-600" size={20} />
                  <span>Scheduled Jobs Management</span>
                  <Badge variant="secondary" className="ml-2">
                    Active Jobs
                  </Badge>
                </div>
                <div className="text-right text-sm">
                  <p className="text-slate-600">Manage assignments and updates</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <ScheduledJobsList />
            </CardContent>
          </Card>
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
    mutationFn: (jobId: string) => apiRequest(`/api/jobs/${jobId}/approve`, { 
      method: "PUT",
      body: JSON.stringify({ approvedBy: "office-staff-1" })
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
      apiRequest(`/api/jobs/${jobId}/reject`, { 
        method: "PUT",
        body: JSON.stringify({ reason, rejectedBy: "office-staff-1" })
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [newStaffForm, setNewStaffForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'technician',
    phone: ''
  });
  const [isAddingStaff, setIsAddingStaff] = useState(false);

  const { data: staff = [], isLoading: staffLoading, refetch: refetchStaff } = useQuery({
    queryKey: ['/api/staff'],
    queryFn: async () => {
      const response = await fetch('/api/staff');
      if (!response.ok) throw new Error('Failed to fetch staff');
      return response.json();
    },
  });

  const { data: staffPerformance = {}, isLoading: performanceLoading } = useQuery({
    queryKey: ['/api/staff/performance'],
    queryFn: async () => {
      const response = await fetch('/api/staff/performance');
      if (!response.ok) throw new Error('Failed to fetch staff performance');
      return response.json();
    },
  });

  const addStaffMutation = useMutation({
    mutationFn: async (staffData: any) => {
      return apiRequest('/api/staff', 'POST', staffData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Staff member added successfully",
      });
      setNewStaffForm({
        firstName: '',
        lastName: '',
        email: '',
        role: 'technician',
        phone: ''
      });
      setIsAddingStaff(false);
      refetchStaff();
      queryClient.invalidateQueries({ queryKey: ['/api/staff/performance'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add staff member",
        variant: "destructive",
      });
    },
  });

  const handleAddStaff = () => {
    if (!newStaffForm.firstName || !newStaffForm.lastName || !newStaffForm.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    addStaffMutation.mutate(newStaffForm);
  };

  if (staffLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Staff Management & Performance</CardTitle>
        <Button 
          onClick={() => setIsAddingStaff(true)}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-add-staff"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </CardHeader>
      <CardContent>
        {/* Add Staff Form */}
        {isAddingStaff && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border">
            <h4 className="font-medium mb-4">Add New Staff Member</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  value={newStaffForm.firstName}
                  onChange={(e) => setNewStaffForm({...newStaffForm, firstName: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  data-testid="input-staff-firstname"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input
                  type="text"
                  value={newStaffForm.lastName}
                  onChange={(e) => setNewStaffForm({...newStaffForm, lastName: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  data-testid="input-staff-lastname"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={newStaffForm.email}
                  onChange={(e) => setNewStaffForm({...newStaffForm, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  data-testid="input-staff-email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={newStaffForm.phone}
                  onChange={(e) => setNewStaffForm({...newStaffForm, phone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  data-testid="input-staff-phone"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={newStaffForm.role}
                  onChange={(e) => setNewStaffForm({...newStaffForm, role: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  data-testid="select-staff-role"
                >
                  <option value="technician">Technician</option>
                  <option value="inspector">Inspector</option>
                  <option value="office_staff">Office Staff</option>
                  <option value="property_manager">Property Manager</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={handleAddStaff}
                disabled={addStaffMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-save-staff"
              >
                {addStaffMutation.isPending ? 'Adding...' : 'Add Staff Member'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsAddingStaff(false)}
                data-testid="button-cancel-add-staff"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Staff List with Performance */}
        <div className="space-y-4">
          {staff.map((member: any) => {
            const performance = staffPerformance[member.id] || { completedJobs: 0, callbacks: 0 };
            const callbackRate = performance.completedJobs > 0 
              ? ((performance.callbacks / performance.completedJobs) * 100).toFixed(1)
              : '0.0';

            return (
              <div 
                key={member.id}
                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                data-testid={`staff-card-${member.id}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">
                          {member.firstName} {member.lastName}
                        </h4>
                        <p className="text-sm text-slate-600">{member.role.replace('_', ' ')}</p>
                      </div>
                      <Badge className="capitalize">
                        {member.role.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600" data-testid={`completed-jobs-${member.id}`}>
                          {performance.completedJobs}
                        </p>
                        <p className="text-sm text-slate-600">Completed Jobs</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600" data-testid={`callbacks-${member.id}`}>
                          {performance.callbacks}
                        </p>
                        <p className="text-sm text-slate-600">Callbacks</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600" data-testid={`callback-rate-${member.id}`}>
                          {callbackRate}%
                        </p>
                        <p className="text-sm text-slate-600">Callback Rate</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                      <div className="flex items-center">
                        <Mail className="mr-1 h-4 w-4" />
                        {member.email}
                      </div>
                      {member.phone && (
                        <div className="flex items-center">
                          <Phone className="mr-1 h-4 w-4" />
                          {member.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedStaff(member.id)}
                      data-testid={`button-view-details-${member.id}`}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid={`button-edit-staff-${member.id}`}
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {staff.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first staff member.
              </p>
            </div>
          )}
        </div>
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

// Quotes Section Component
function QuotesSection({ quoteRequests, isLoading }: { quoteRequests: any[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Quote Requests</h3>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Quote Requests</h3>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {quoteRequests.length} Pending
        </Badge>
      </div>

      {quoteRequests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Quote Requests</h4>
            <p className="text-gray-600">
              There are no pending quote requests at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quoteRequests.map((quote: any) => (
            <Card key={quote.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">{quote.title}</h4>
                    <p className="text-gray-600 mb-2">{quote.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {quote.propertyId}
                      </span>
                      {quote.unitNumber && (
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Unit {quote.unitNumber}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant="outline" className={getPriorityColor(quote.priority)}>
                      {quote.priority}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {quote.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    Requested by: {quote.requesterId}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Follow Up
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}