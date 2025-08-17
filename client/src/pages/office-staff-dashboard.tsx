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
      return apiRequest("POST", "/api/quote-requests", quoteData);
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
              <Label htmlFor="unit-number">Unit Number</Label>
              <Input
                id="unit-number"
                placeholder="e.g., 205"
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
                  <SelectValue />
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
                  <SelectValue />
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

// Message Staff Button Component
function MessageStaffButton() {
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest("POST", "/api/messages", messageData);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setOpen(false);
      // Reset form
      setRecipient("");
      setSubject("");
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!recipient || !subject || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      recipient,
      subject,
      message,
      senderId: "office-staff-1",
      conversationId: `office-${Date.now()}`
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-message-staff">
          <MessageSquare className="mr-2 h-4 w-4" />
          Message Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Message to Staff</DialogTitle>
          <DialogDescription>
            Send a message to staff members or the entire team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="recipient">Recipient *</Label>
            <Select value={recipient} onValueChange={setRecipient}>
              <SelectTrigger data-testid="select-recipient">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="office-manager">Office Manager</SelectItem>
                <SelectItem value="admin-assistant">Administrative Assistant</SelectItem>
                <SelectItem value="property-manager">Property Manager</SelectItem>
                <SelectItem value="all-staff">All Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="e.g., Urgent: Tenant complaint - Unit 205"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              data-testid="input-message-subject"
            />
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              data-testid="textarea-message-content"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending}
              className="flex-1"
              data-testid="button-send-message"
            >
              {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Schedule Job Button Component
function ScheduleJobButton() {
  const [open, setOpen] = useState(false);
  const [property, setProperty] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [bedroomSize, setBedroomSize] = useState("");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [jobLocation, setJobLocation] = useState(""); // "in-unit" or "on-property"
  const [scheduledDate, setScheduledDate] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedTechnician, setAssignedTechnician] = useState("");
  const [priority, setPriority] = useState("medium");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const scheduleJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      return apiRequest("POST", "/api/jobs/schedule", jobData);
    },
    onSuccess: () => {
      toast({
        title: "Job Scheduled",
        description: "New job has been successfully scheduled.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/office"] });
      setOpen(false);
      // Reset form
      setProperty("");
      setUnitNumber("");
      setBedroomSize("");
      setSelectedJobs([]);
      setJobLocation("");
      setScheduledDate("");
      setNotes("");
      setAssignedTechnician("");
      setPriority("medium");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to schedule job. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleScheduleJob = () => {
    if (!property || !unitNumber || !bedroomSize || selectedJobs.length === 0 || !jobLocation || !scheduledDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one job type.",
        variant: "destructive",
      });
      return;
    }

    scheduleJobMutation.mutate({
      property,
      unitNumber,
      bedroomSize,
      jobTypes: selectedJobs,
      location: jobLocation,
      scheduledDate,
      notes,
      assignedTechnician: assignedTechnician || null,
      priority,
      status: "scheduled",
      scheduledBy: "office-staff"
    });
  };

  const toggleJobSelection = (jobType: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobType) 
        ? prev.filter(job => job !== jobType)
        : [...prev, jobType]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-schedule-new-job">
          <Plus size={16} className="mr-2" />
          Schedule New Job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Job</DialogTitle>
          <DialogDescription>
            Create multiple job assignments for a unit.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Property Selection */}
          <div>
            <Label htmlFor="property">Property *</Label>
            <Select value={property} onValueChange={setProperty}>
              <SelectTrigger data-testid="select-property">
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maple-gardens">Maple Gardens</SelectItem>
                <SelectItem value="oak-village">Oak Village</SelectItem>
                <SelectItem value="pine-heights">Pine Heights</SelectItem>
                <SelectItem value="willow-creek">Willow Creek</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Unit Number */}
            <div>
              <Label htmlFor="unitNumber">Unit Number *</Label>
              <Input
                id="unitNumber"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="e.g., 205"
                data-testid="input-unit-number"
              />
            </div>

            {/* Bedroom Size */}
            <div>
              <Label htmlFor="bedroomSize">Bedroom Size *</Label>
              <Select value={bedroomSize} onValueChange={setBedroomSize}>
                <SelectTrigger data-testid="select-bedroom-size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="1br">1 Bedroom</SelectItem>
                  <SelectItem value="2br">2 Bedroom</SelectItem>
                  <SelectItem value="3br">3+ Bedroom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Job Types - Multiple Selection */}
          <div>
            <Label>Job Types * (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {['punch', 'paint', 'clean', 'carpet', 'repairs', 'bulk-trash'].map((jobType) => (
                <div key={jobType} className="flex items-center space-x-2">
                  <Checkbox
                    id={`job-${jobType}`}
                    checked={selectedJobs.includes(jobType)}
                    onCheckedChange={() => toggleJobSelection(jobType)}
                    data-testid={`checkbox-${jobType}`}
                  />
                  <Label htmlFor={`job-${jobType}`} className="text-sm font-medium capitalize">
                    {jobType === 'bulk-trash' ? 'Bulk Trash' : jobType}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Job Location */}
          <div>
            <Label htmlFor="jobLocation">Location *</Label>
            <Select value={jobLocation} onValueChange={setJobLocation}>
              <SelectTrigger data-testid="select-job-location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-unit">In Unit</SelectItem>
                <SelectItem value="on-property">On Property</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Scheduled Date */}
            <div>
              <Label htmlFor="scheduledDate">Scheduled Date *</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                data-testid="input-scheduled-date"
              />
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger data-testid="select-priority">
                  <SelectValue />
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

          {/* Assigned Technician */}
          <div>
            <Label htmlFor="assignedTechnician">Assigned Technician</Label>
            <Select value={assignedTechnician} onValueChange={setAssignedTechnician}>
              <SelectTrigger data-testid="select-assigned-technician">
                <SelectValue placeholder="Select technician (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                <SelectItem value="tech-1">John Smith</SelectItem>
                <SelectItem value="tech-2">Mike Johnson</SelectItem>
                <SelectItem value="tech-3">Sarah Williams</SelectItem>
                <SelectItem value="tech-4">David Brown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or special instructions..."
              data-testid="textarea-notes"
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              data-testid="button-cancel-job"
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleJob}
              disabled={scheduleJobMutation.isPending}
              className="flex-1"
              data-testid="button-confirm-schedule-job"
            >
              {scheduleJobMutation.isPending ? "Scheduling..." : "Schedule Job"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
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
          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Office Staff Dashboard</h2>
            <div className="flex items-center space-x-3">
              <RequestQuoteButton />
              <MessageStaffButton />
              <ScheduleJobButton />
            </div>
          </div>

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            {/* Color-Coded Job Calendar - Spans 2 columns */}
            <Card className="lg:col-span-2">
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
          </div>
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
    mutationFn: (jobId: string) => apiRequest("PUT", `/api/jobs/${jobId}/approve`, { 
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
      apiRequest("PUT", `/api/jobs/${jobId}/reject`, { 
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