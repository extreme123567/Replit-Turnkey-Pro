import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar,
  Clock,
  Plus,
  MapPin,
  CheckCircle,
  Wrench,
  Palette,
  Sparkles,
  Square,
  Trash2,
  PackageX,
  UserCheck,
  Home
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const jobSchedulingSchema = z.object({
  unitNumber: z.string().min(1, "Unit number is required"),
  propertyId: z.string().min(1, "Property selection is required"),
  bedroomSize: z.enum(["studio", "1_bed", "2_bed", "3_bed", "loft", "1_bed_townhome", "2_bed_townhome", "3_bed_townhome"]),
  moveInDate: z.string().min(1, "Move-in date is required"),
  completionDate: z.string().min(1, "Completion date is required"),
  selectedJobs: z.array(z.string()).min(1, "At least one job must be selected"),
  priority: z.enum(["low", "medium", "high"]),
  notes: z.string().optional(),
});

type JobSchedulingForm = z.infer<typeof jobSchedulingSchema>;

const BEDROOM_SIZES = [
  { value: "studio", label: "Studio" },
  { value: "1_bed", label: "1 Bedroom" },
  { value: "2_bed", label: "2 Bedroom" },
  { value: "3_bed", label: "3 Bedroom" },
  { value: "loft", label: "Loft" },
  { value: "1_bed_townhome", label: "1 Bedroom Townhome" },
  { value: "2_bed_townhome", label: "2 Bedroom Townhome" },
  { value: "3_bed_townhome", label: "3 Bedroom Townhome" },
] as const;

const JOB_TYPES = [
  { id: "punch", name: "Punch List", icon: Calendar, color: "blue", description: "Final walk-through and touch-ups" },
  { id: "repairs", name: "Repairs", icon: Wrench, color: "amber", description: "Fix maintenance issues" },
  { id: "paint", name: "Paint", icon: Palette, color: "purple", description: "Wall painting and touch-ups" },
  { id: "clean", name: "Clean", icon: Sparkles, color: "teal", description: "Deep cleaning and sanitization" },
  { id: "carpet", name: "Carpet", icon: Square, color: "orange", description: "Carpet cleaning or replacement" },
  { id: "unit_trash_out", name: "Unit Trash Out", icon: Trash2, color: "slate", description: "Remove all debris and items (2 photos required)" },
  { id: "onsite_bulk_trash", name: "Onsite Bulk Trash", icon: PackageX, color: "yellow", description: "Large item disposal (2 photos required)" },
  { id: "inspected", name: "Final Inspection", icon: UserCheck, color: "green", description: "Quality assurance check" },
];

export default function Scheduling() {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch properties for the dropdown
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<any[]>({
    queryKey: ["/api/properties"],
  });
  
  const form = useForm<JobSchedulingForm>({
    resolver: zodResolver(jobSchedulingSchema),
    defaultValues: {
      selectedJobs: [],
      priority: "medium",
      bedroomSize: "1_bed",
    },
  });

  const scheduleJobsMutation = useMutation({
    mutationFn: async (data: JobSchedulingForm) => {
      return await apiRequest("/api/jobs/schedule", { method: "POST", body: data });
    },
    onSuccess: (response: any) => {
      toast({
        title: "Jobs Scheduled Successfully",
        description: `${response.jobsScheduled} jobs have been scheduled for unit ${form.getValues("unitNumber")}`,
      });
      // Reset form after successful submission
      form.reset();
      setSelectedJobs([]);
    },
    onError: (error) => {
      toast({
        title: "Scheduling Failed",
        description: "Unable to schedule jobs. Please try again.",
        variant: "destructive",
      });
      console.error("Error scheduling jobs:", error);
    },
  });

  const handleJobToggle = (jobId: string) => {
    const updated = selectedJobs.includes(jobId)
      ? selectedJobs.filter(id => id !== jobId)
      : [...selectedJobs, jobId];
    
    setSelectedJobs(updated);
    form.setValue("selectedJobs", updated);
  };

  const seedDataMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/dev/seed-data", { method: "POST" });
    },
    onSuccess: () => {
      toast({
        title: "Test Data Created",
        description: "Sample properties have been added for testing the scheduling system",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Create Test Data",
        description: "Unable to create sample properties",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: JobSchedulingForm) => {
    scheduleJobsMutation.mutate(data);
  };

  const getJobColor = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      amber: "bg-amber-100 text-amber-800 border-amber-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      teal: "bg-teal-100 text-teal-800 border-teal-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      slate: "bg-slate-100 text-slate-800 border-slate-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      green: "bg-green-100 text-green-800 border-green-200",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Job Scheduling</h1>
          <p className="text-slate-600">Schedule multiple jobs for unit preparation</p>
        </div>
        <Button 
          onClick={() => seedDataMutation.mutate()}
          disabled={seedDataMutation.isPending}
          variant="outline"
          className="text-sm"
          data-testid="button-create-test-data"
        >
          {seedDataMutation.isPending ? "Creating..." : "Create Test Properties"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Scheduling Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="text-blue-600" size={20} />
                <span>Unit Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertyId">Property</Label>
                    <Select onValueChange={(value) => form.setValue("propertyId", value)}>
                      <SelectTrigger data-testid="select-property">
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertiesLoading ? (
                          <SelectItem value="loading" disabled>Loading properties...</SelectItem>
                        ) : properties.length === 0 ? (
                          <SelectItem value="none" disabled>No properties available - Click "Create Test Properties"</SelectItem>
                        ) : (
                          properties.map((property: any) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.name} - {property.address}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="unitNumber">Unit Number</Label>
                    <Input
                      id="unitNumber"
                      placeholder="e.g., 205A"
                      {...form.register("unitNumber")}
                      data-testid="input-unit-number"
                    />
                    {form.formState.errors.unitNumber && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.unitNumber.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bedroomSize">Unit Type</Label>
                    <Select onValueChange={(value) => form.setValue("bedroomSize", value as any)}>
                      <SelectTrigger data-testid="select-bedroom-size">
                        <SelectValue placeholder="Select unit type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BEDROOM_SIZES.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.bedroomSize && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.bedroomSize.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select onValueChange={(value) => form.setValue("priority", value as "low" | "medium" | "high")}>
                      <SelectTrigger data-testid="select-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="moveInDate">Move-In Date</Label>
                    <Input
                      id="moveInDate"
                      type="date"
                      {...form.register("moveInDate")}
                      data-testid="input-move-in-date"
                    />
                    {form.formState.errors.moveInDate && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.moveInDate.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="completionDate">Target Completion Date</Label>
                    <Input
                      id="completionDate"
                      type="date"
                      {...form.register("completionDate")}
                      data-testid="input-completion-date"
                    />
                    {form.formState.errors.completionDate && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.completionDate.message}</p>
                    )}
                  </div>
                </div>



                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Special instructions, tenant preferences, or additional requirements..."
                    {...form.register("notes")}
                    data-testid="textarea-notes"
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Job Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="text-green-600" size={20} />
                <span>Select Jobs for Unit</span>
                <Badge variant="outline">{selectedJobs.length} selected</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {JOB_TYPES.map((job) => {
                  const Icon = job.icon;
                  const isSelected = selectedJobs.includes(job.id);
                  
                  return (
                    <div
                      key={job.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? `${getJobColor(job.color)} border-current` 
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => handleJobToggle(job.id)}
                      data-testid={`job-${job.id}`}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleJobToggle(job.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Icon size={16} className={isSelected ? "text-current" : "text-slate-600"} />
                            <span className={`font-medium ${isSelected ? "text-current" : "text-slate-800"}`}>
                              {job.name}
                            </span>
                          </div>
                          <p className={`text-sm ${isSelected ? "text-current opacity-80" : "text-slate-600"}`}>
                            {job.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Submit Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">Ready to Schedule</p>
                  <p className="text-sm text-slate-600">
                    {selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''} selected for this unit
                  </p>
                </div>
                <Button 
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={selectedJobs.length === 0 || scheduleJobsMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-schedule-jobs"
                >
                  {scheduleJobsMutation.isPending ? (
                    <>
                      <Clock className="mr-2 animate-spin" size={16} />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2" size={16} />
                      Schedule All Jobs
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="text-blue-600" size={20} />
                <span>Schedule Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedJobs.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Unit Preparation Timeline</p>
                    <p className="text-xs text-blue-600 mt-1">Jobs will be scheduled in optimal order</p>
                  </div>
                  
                  {selectedJobs.map((jobId, index) => {
                    const job = JOB_TYPES.find(j => j.id === jobId);
                    if (!job) return null;
                    
                    const Icon = job.icon;
                    
                    return (
                      <div key={jobId} className="flex items-center space-x-3 p-2 border border-slate-200 rounded">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <Icon size={16} className="text-slate-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{job.name}</p>
                          <p className="text-xs text-slate-600">Day {index + 1}</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Final Inspection</p>
                    <p className="text-xs text-green-600">Unit ready for move-in</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="mx-auto text-slate-400 mb-3" size={32} />
                  <p className="text-slate-500">Select jobs to see preview</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photo Requirements Alert */}
          {(selectedJobs.includes("unit_trash_out") || selectedJobs.includes("onsite_bulk_trash")) && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-800 text-sm">Photo Requirements</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {selectedJobs.includes("unit_trash_out") && (
                    <div className="flex items-center space-x-2 text-sm text-yellow-700">
                      <Trash2 size={14} />
                      <span>Unit Trash Out: 2 photos required</span>
                    </div>
                  )}
                  {selectedJobs.includes("onsite_bulk_trash") && (
                    <div className="flex items-center space-x-2 text-sm text-yellow-700">
                      <PackageX size={14} />
                      <span>Bulk Trash: 2 photos required</span>
                    </div>
                  )}
                  <p className="text-xs text-yellow-600 mt-2">
                    Photos must be sent to office before job completion
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}