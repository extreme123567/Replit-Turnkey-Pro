import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Wrench,
  DollarSign,
  Plus,
  Eye,
  MapPin,
  MessageSquare,
  Clock,
  UserCheck,
  Send,
  Palette,
  Square,
  Sparkles,
  Trash2,
  PackageX,
  CheckCircle,
  Camera,
  Upload
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageGallery } from "@/components/image-editor/ImageGallery";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PropertyManagerStats {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: string;
  monthlyRent: string;
  openWorkOrders: number;
  emergencyWorkOrders: number;
}

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  units: number;
  occupancyRate?: number;
  monthlyRent: string;
  status: string;
}

export default function PropertyManagerDashboard() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // For demo, we'll use a mock property manager ID
  const propertyManagerId = "pm-1";
  
  // Modal states
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [selectedJobForCallback, setSelectedJobForCallback] = useState<any>(null);
  
  // Filter state for jobs
  const [jobFilter, setJobFilter] = useState("all"); // all, scheduled, in_progress, completed
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  
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
  
  // Form states
  const [messageForm, setMessageForm] = useState({
    recipient: '',
    subject: '',
    message: ''
  });

  const [quoteRequestForm, setQuoteRequestForm] = useState({
    title: '',
    description: '',
    propertyId: '',
    unitNumber: '',
    category: 'apartment-turn',
    priority: 'medium'
  });

  const [callbackRequestForm, setCallbackRequestForm] = useState({
    reason: '',
    description: '',
    priority: 'medium',
    photos: [],
    photoNotes: ['', '', '']
  });

  const handleQuoteRequest = async () => {
    try {
      const response = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...quoteRequestForm,
          requestedBy: propertyManagerId,
          status: 'pending',
          createdAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quote request');
      }

      // Reset form and close modal
      setQuoteRequestForm({
        title: '',
        description: '',
        propertyId: '',
        unitNumber: '',
        category: 'apartment-turn',
        priority: 'medium'
      });
      setIsQuoteModalOpen(false);
      
      alert('Quote request submitted successfully! Office staff will respond soon.');
    } catch (error) {
      console.error('Error submitting quote request:', error);
      alert('Failed to submit quote request. Please try again.');
    }
  };

  const handleCallbackRequest = async () => {
    if (!selectedJobForCallback) return;
    
    try {
      const response = await fetch('/api/work-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Callback - ${selectedJobForCallback.title}`,
          description: `Callback requested for completed job: ${callbackRequestForm.description}`,
          propertyId: selectedJobForCallback.propertyId,
          category: 'callback',
          priority: callbackRequestForm.priority,
          assignedTechnicianId: selectedJobForCallback.assignedTechnicianId,
          requestedBy: propertyManagerId,
          originalJobId: selectedJobForCallback.id,
          callbackReason: callbackRequestForm.reason,
          callbackPhotos: callbackRequestForm.photos,
          photoNotes: callbackRequestForm.photoNotes.filter(note => note.trim() !== ''),
          status: 'scheduled',
          createdAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit callback request');
      }

      // Reset form and close modal
      setCallbackRequestForm({
        reason: '',
        description: '',
        priority: 'medium',
        photos: [],
        photoNotes: ['', '', '']
      });
      setIsCallbackModalOpen(false);
      setSelectedJobForCallback(null);
      
      alert('Callback request submitted successfully! The technician will be notified.');
    } catch (error) {
      console.error('Error submitting callback request:', error);
      alert('Failed to submit callback request. Please try again.');
    }
  };

  const openCallbackModal = (workOrder: any) => {
    setSelectedJobForCallback(workOrder);
    setCallbackRequestForm({
      reason: '',
      description: '',
      priority: 'medium',
      photos: [],
      photoNotes: ['', '', '']
    });
    setIsCallbackModalOpen(true);
  };

  // Approval mutations
  const approveRequestMutation = useMutation({
    mutationFn: async ({ requestId, type }: { requestId: string; type: string }) => {
      const response = await apiRequest(`/api/approval-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: propertyManagerId, type })
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Request Approved",
        description: `${variables.type} request has been approved successfully.`,
      });
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/approval-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async ({ requestId, type, reason }: { requestId: string; type: string; reason?: string }) => {
      const response = await apiRequest(`/api/approval-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectedBy: propertyManagerId, type, rejectionReason: reason })
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Request Rejected",
        description: `${variables.type} request has been rejected.`,
      });
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/approval-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleApproveRequest = (requestId: string, type: string) => {
    approveRequestMutation.mutate({ requestId, type });
  };

  const handleRejectRequest = (requestId: string, type: string, reason?: string) => {
    rejectRequestMutation.mutate({ requestId, type, reason });
  };



  const [quoteForm, setQuoteForm] = useState({
    title: '',
    description: '',
    property: '',
    unitNumber: '',
    category: 'maintenance',
    priority: 'medium',
    estimatedBudget: '',
    preferredStartDate: '',
    preferredEndDate: ''
  });

  // Data fetching
  const { data: stats, isLoading: statsLoading } = useQuery<PropertyManagerStats>({
    queryKey: ["/api/dashboard/property-manager", propertyManagerId],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/property-manager/${propertyManagerId}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const { data: properties, isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties/manager", propertyManagerId],
    queryFn: async () => {
      const response = await fetch(`/api/properties/manager/${propertyManagerId}`);
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs", { managerId: propertyManagerId }],
    queryFn: async () => {
      const response = await fetch(`/api/jobs?managerId=${propertyManagerId}`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return response.json();
    },
  });

  const { data: workOrders, isLoading: workOrdersLoading } = useQuery({
    queryKey: ["/api/work-orders/manager", propertyManagerId],
    queryFn: async () => {
      const response = await fetch(`/api/work-orders/manager/${propertyManagerId}`);
      if (!response.ok) throw new Error('Failed to fetch work orders');
      return response.json();
    },
  });

  // Search completed units
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

  const isLoading = statsLoading || propertiesLoading || jobsLoading || workOrdersLoading;

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
          <h2 className="text-3xl font-bold text-slate-800">Property Manager Dashboard</h2>
          <p className="text-slate-600">Manage your properties and oversee operations</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-request-quote">
                <DollarSign className="mr-2 h-4 w-4" />
                Request Quote
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Request Quote from Office</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="quote-title">Service Title</Label>
                  <Input
                    id="quote-title"
                    placeholder="e.g., Kitchen renovation - Unit 205"
                    value={quoteRequestForm.title}
                    onChange={(e) => setQuoteRequestForm({...quoteRequestForm, title: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quote-description">Detailed Description</Label>
                  <Textarea
                    id="quote-description"
                    placeholder="Describe the work needed in detail..."
                    rows={3}
                    value={quoteRequestForm.description}
                    onChange={(e) => setQuoteRequestForm({...quoteRequestForm, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="property">Property</Label>
                    <Select value={quoteRequestForm.propertyId} onValueChange={(value) => setQuoteRequestForm({...quoteRequestForm, propertyId: value})}>
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
                    <Label htmlFor="unit-number">Unit Number / Common Area Space</Label>
                    <Input
                      id="unit-number"
                      placeholder="e.g., 205, Lobby, Pool Area, Gym"
                      value={quoteRequestForm.unitNumber}
                      onChange={(e) => setQuoteRequestForm({...quoteRequestForm, unitNumber: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsQuoteModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="servicepro-btn-primary" onClick={handleQuoteRequest}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Request Quote
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-message-staff">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message Office Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Message to Office Staff</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="recipient">Recipient</Label>
                  <Select value={messageForm.recipient} onValueChange={(value) => setMessageForm({...messageForm, recipient: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office-manager">Office Manager</SelectItem>
                      <SelectItem value="admin-assistant">Administrative Assistant</SelectItem>
                      <SelectItem value="all-office-staff">All Office Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Urgent: Tenant complaint - Unit 205"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    rows={4}
                    value={messageForm.message}
                    onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsMessageModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="servicepro-btn-primary">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          

        </div>
      </div>

      {/* Job Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Scheduled Jobs</p>
                <p className="text-2xl font-bold text-blue-600 mt-1" data-testid="stat-scheduled-jobs">
                  {workOrders?.filter((order: any) => order.status === 'scheduled')?.length || 3}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Ready to start</p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold text-amber-600 mt-1" data-testid="stat-in-progress-jobs">
                  {workOrders?.filter((order: any) => order.status === 'in_progress')?.length || 4}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="text-amber-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Currently active</p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Completed Today</p>
                <p className="text-2xl font-bold text-green-600 mt-1" data-testid="stat-completed-jobs">
                  {workOrders?.filter((order: any) => order.status === 'completed')?.length || 6}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Finished jobs</p>
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
                data-testid="input-search-completed"
              />
            </div>
            <Button 
              onClick={() => setShowSearchResults(true)}
              disabled={!searchQuery.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-search-completed"
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
                  data-testid="button-clear-search"
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
                                {getBedroomSizeDisplay(unit.bedroomSize)}
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

      {/* Approval Queue - Extra Dirty Units & Drywall Repairs */}
      <Card className="servicepro-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Approval Queue</span>
            <Badge variant="secondary">
              2 pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {/* Extra Dirty Unit Request */}
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="text-amber-600" size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Extra Dirty Unit - Unit 205</p>
                    <p className="text-sm text-slate-600">Requires additional cleaning time beyond standard</p>
                    <p className="text-xs text-amber-600">Tech: Mike Johnson → Office Staff → Property Manager</p>
                    <p className="text-xs text-slate-500 mt-1">Submitted: 2 hours ago • Extra 4 hours needed</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 border-red-200"
                    onClick={() => handleRejectRequest('extra-dirty-205', 'Extra Dirty Unit', 'Not necessary')}
                    disabled={rejectRequestMutation.isPending}
                    data-testid="button-reject-extra-dirty"
                  >
                    {rejectRequestMutation.isPending ? 'Rejecting...' : 'Reject'}
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleApproveRequest('extra-dirty-205', 'Extra Dirty Unit')}
                    disabled={approveRequestMutation.isPending}
                    data-testid="button-approve-extra-dirty"
                  >
                    {approveRequestMutation.isPending ? 'Approving...' : 'Approve'}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Extra Drywall Repair Request */}
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Wrench className="text-red-600" size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Extra Drywall Repair - Unit 301</p>
                    <p className="text-sm text-slate-600">Additional drywall damage found during paint prep</p>
                    <p className="text-xs text-red-600">Tech: Sarah Wilson → Office Staff → Property Manager</p>
                    <p className="text-xs text-slate-500 mt-1">Submitted: 1 hour ago • Cost: $350 • Photos attached</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    data-testid="button-view-photos"
                  >
                    View Photos
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 border-red-200"
                    onClick={() => handleRejectRequest('drywall-301', 'Extra Drywall Repair', 'Cost too high')}
                    disabled={rejectRequestMutation.isPending}
                    data-testid="button-reject-drywall"
                  >
                    {rejectRequestMutation.isPending ? 'Rejecting...' : 'Reject'}
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleApproveRequest('drywall-301', 'Extra Drywall Repair')}
                    disabled={approveRequestMutation.isPending}
                    data-testid="button-approve-drywall"
                  >
                    {approveRequestMutation.isPending ? 'Approving...' : 'Approve'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Recently Approved Section */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-600 mb-3">Recently Approved</p>
              <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">Extra Dirty Unit - Unit 203</p>
                    <p className="text-sm text-green-600">✓ Approved - Notification sent to Office Staff & Technician</p>
                    <p className="text-xs text-slate-500">Approved: 30 minutes ago • Tech can proceed with extended cleaning</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Approved</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Filtering and Progress Tracking */}
      <Card className="servicepro-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Job Status & Progress</span>
            <div className="flex items-center space-x-2">
              <Button
                variant={jobFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setJobFilter("all")}
                data-testid="filter-all-jobs"
              >
                All Jobs
              </Button>
              <Button
                variant={jobFilter === "scheduled" ? "default" : "outline"}
                size="sm"
                onClick={() => setJobFilter("scheduled")}
                data-testid="filter-scheduled-jobs"
              >
                Scheduled
              </Button>
              <Button
                variant={jobFilter === "in_progress" ? "default" : "outline"}
                size="sm"
                onClick={() => setJobFilter("in_progress")}
                data-testid="filter-in-progress-jobs"
              >
                In Progress
              </Button>
              <Button
                variant={jobFilter === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setJobFilter("completed")}
                data-testid="filter-completed-jobs"
              >
                Completed
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {/* Job Status Display */}
            <div className="space-y-3">
              {/* Show actual work orders */}
              {workOrders?.filter((wo: any) => jobFilter === "all" || wo.status === jobFilter || 
                (jobFilter === "scheduled" && wo.status === "scheduled")).map((workOrder: any) => (
                <div 
                  key={workOrder.id} 
                  className={`p-4 border rounded-lg ${
                    workOrder.status === "scheduled" ? "border-blue-200 bg-blue-50" :
                    workOrder.status === "assigned" ? "border-purple-200 bg-purple-50" :
                    workOrder.status === "in_progress" ? "border-amber-200 bg-amber-50" :
                    "border-green-200 bg-green-50"
                  }`}
                  data-testid={`work-order-${workOrder.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        workOrder.status === "scheduled" ? "bg-blue-100" :
                        workOrder.status === "assigned" ? "bg-purple-100" :
                        workOrder.status === "in_progress" ? "bg-amber-100" :
                        "bg-green-100"
                      }`}>
                        {workOrder.status === "scheduled" ? <Calendar className="text-blue-600" size={16} /> :
                         workOrder.status === "assigned" ? <UserCheck className="text-purple-600" size={16} /> :
                         workOrder.status === "in_progress" ? <Clock className="text-amber-600" size={16} /> :
                         <CheckCircle className="text-green-600" size={16} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-800">{workOrder.title}</p>
                          {workOrder.bedroomSize && (
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              {getBedroomSizeDisplay(workOrder.bedroomSize)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{workOrder.description} • Est. {workOrder.estimatedHours} hours</p>
                        <p className={`text-xs mt-1 ${
                          workOrder.status === "scheduled" ? "text-blue-600" :
                          workOrder.status === "assigned" ? "text-purple-600" :
                          workOrder.status === "in_progress" ? "text-amber-600" :
                          "text-green-600"
                        }`}>
                          {workOrder.status === "scheduled" ? `Scheduled: ${new Date(workOrder.scheduledDate).toLocaleDateString()} ${new Date(workOrder.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` :
                           workOrder.status === "completed" ? `Completed: ${workOrder.completedDate ? new Date(workOrder.completedDate).toLocaleDateString() : 'Today'}` :
                           workOrder.status === "assigned" ? "Assigned - Ready to start" :
                           "In Progress"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="space-y-1">
                        <Badge className={getStatusColor(workOrder.status)}>
                          {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1).replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(workOrder.priority)} variant="outline">
                          {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {workOrder.assignedTo ? `Tech: ${workOrder.assignedTo}` : "Pending Office Assignment"}
                      </p>
                      {workOrder.status === 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 text-xs"
                          onClick={() => openCallbackModal(workOrder)}
                          data-testid={`button-callback-${workOrder.id}`}
                        >
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Request Callback
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Show message if no work orders */}
              {(!workOrders || workOrders.length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  <Clock className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p>No work orders found</p>
                  <p className="text-sm">Work orders will appear here when created</p>
                </div>
              )}


            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule Overview */}
      <Card className="servicepro-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>This Week's Schedule</span>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View Calendar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-3">
              {/* Weekly Timeline */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-600 mb-4">
                <div>Mon</div>
                <div>Tue</div>
                <div className="text-blue-600 font-semibold">Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {/* Monday */}
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">15</div>
                  <div className="bg-blue-100 text-blue-700 text-xs p-1 rounded">2 jobs</div>
                </div>
                {/* Tuesday */}
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">16</div>
                  <div className="bg-emerald-100 text-emerald-700 text-xs p-1 rounded">1 job</div>
                </div>
                {/* Wednesday (Today) */}
                <div className="space-y-1">
                  <div className="text-xs text-blue-600 font-semibold">17</div>
                  <div className="bg-blue-200 text-blue-800 text-xs p-1 rounded font-medium">3 jobs</div>
                </div>
                {/* Thursday */}
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">18</div>
                  <div className="bg-amber-100 text-amber-700 text-xs p-1 rounded">4 jobs</div>
                </div>
                {/* Friday */}
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">19</div>
                  <div className="bg-green-100 text-green-700 text-xs p-1 rounded">2 jobs</div>
                </div>
                {/* Weekend */}
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">20</div>
                  <div className="bg-slate-100 text-slate-500 text-xs p-1 rounded">0 jobs</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">21</div>
                  <div className="bg-slate-100 text-slate-500 text-xs p-1 rounded">0 jobs</div>
                </div>
              </div>
              
              {/* Summary Stats */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold text-slate-800">12</p>
                    <p className="text-xs text-slate-600">This Week</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-amber-600">5</p>
                    <p className="text-xs text-slate-600">In Progress</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-green-600">7</p>
                    <p className="text-xs text-slate-600">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Photo Requirements Dashboard */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="text-yellow-600" size={20} />
            <span>Photo Requirements - Office Review</span>
            <Badge className="bg-yellow-100 text-yellow-800">2 pending</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-3">
            <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">Unit 305 - Trash Out</p>
                  <p className="text-sm text-yellow-700">Tech: Carlos Martinez</p>
                  <p className="text-xs text-slate-600">Required: 2 photos before completion</p>
                </div>
                <Badge className="bg-yellow-200 text-yellow-800">Awaiting Photos</Badge>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">Building B - Bulk Trash</p>
                  <p className="text-sm text-yellow-700">Tech: Jennifer Kim</p>
                  <p className="text-xs text-slate-600">Required: 2 photos before completion</p>
                </div>
                <Badge className="bg-yellow-200 text-yellow-800">Awaiting Photos</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Status Distribution */}
      <Card className="servicepro-card">
        <CardHeader>
          <CardTitle>Job Phase Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* Punch Jobs */}
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="text-blue-600" size={16} />
              </div>
              <p className="text-lg font-bold text-slate-800">1</p>
              <p className="text-xs text-slate-600">Punch</p>
            </div>

            {/* Repairs */}
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Wrench className="text-amber-600" size={16} />
              </div>
              <p className="text-lg font-bold text-slate-800">1</p>
              <p className="text-xs text-slate-600">Repairs</p>
            </div>

            {/* Paint */}
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Palette className="text-purple-600" size={16} />
              </div>
              <p className="text-lg font-bold text-slate-800">1</p>
              <p className="text-xs text-slate-600">Paint</p>
            </div>

            {/* Clean */}
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sparkles className="text-teal-600" size={16} />
              </div>
              <p className="text-lg font-bold text-slate-800">1</p>
              <p className="text-xs text-slate-600">Clean</p>
            </div>

            {/* Carpet */}
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Square className="text-orange-600" size={16} />
              </div>
              <p className="text-lg font-bold text-slate-800">1</p>
              <p className="text-xs text-slate-600">Carpet</p>
            </div>

            {/* Unit Trash Out */}
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trash2 className="text-slate-600" size={16} />
              </div>
              <p className="text-lg font-bold text-slate-800">1</p>
              <p className="text-xs text-slate-600">Trash Out</p>
            </div>

            {/* Onsite Bulk Trash */}
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <PackageX className="text-yellow-600" size={16} />
              </div>
              <p className="text-lg font-bold text-slate-800">1</p>
              <p className="text-xs text-slate-600">Bulk Trash</p>
            </div>

            {/* Inspected */}
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <UserCheck className="text-green-600" size={16} />
              </div>
              <p className="text-lg font-bold text-slate-800">1</p>
              <p className="text-xs text-slate-600">Inspected</p>
            </div>
          </div>

          {/* Phase Progress Summary */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold text-slate-800">9</p>
                <p className="text-xs text-slate-600">Total Active</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-green-600">6</p>
                <p className="text-xs text-slate-600">Completed Today</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-blue-600">85%</p>
                <p className="text-xs text-slate-600">On Schedule</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Enhanced Photo Management & Communication Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Photo Management */}
        <Card className="servicepro-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Photo Documentation</span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" data-testid="button-upload-photos">
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Photos
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {/* Recent Photo Activity */}
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Camera className="text-blue-600" size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">Before Photos Uploaded</p>
                    <p className="text-xs text-slate-600">Unit 102B damage assessment - 4 photos</p>
                    <p className="text-xs text-blue-600 mt-1">Uploaded: 2 hours ago</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Camera className="text-amber-600" size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">Progress Photos Needed</p>
                    <p className="text-xs text-slate-600">Unit 205 painting - First coat completion</p>
                    <p className="text-xs text-amber-600 mt-1">Waiting for technician upload</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7">
                    <Upload className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">Final Photos Complete</p>
                    <p className="text-xs text-slate-600">Unit 301 carpet installation - 6 photos</p>
                    <p className="text-xs text-green-600 mt-1">Ready for inspection</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="text-center py-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  View Photo Gallery
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication Center */}
        <Card className="servicepro-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Communication Center</span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" data-testid="button-new-message">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  New Message
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {/* Recent Messages */}
              <div className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="text-blue-600" size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-800 text-sm">Message to Office Manager</p>
                      <p className="text-xs text-slate-500">10 min ago</p>
                    </div>
                    <p className="text-xs text-slate-600">RE: Emergency repair approval for Unit 205</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs">Urgent</Badge>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Approved</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-purple-600" size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-800 text-sm">Quote Request Submitted</p>
                      <p className="text-xs text-slate-500">1 hour ago</p>
                    </div>
                    <p className="text-xs text-slate-600">Kitchen renovation - Unit 302 • $2,500 budget</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">Pending Review</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Wrench className="text-amber-600" size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-800 text-sm">Technician Update</p>
                      <p className="text-xs text-slate-500">2 hours ago</p>
                    </div>
                    <p className="text-xs text-slate-600">Mike Johnson: Paint job 80% complete - Unit 301</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">Progress Update</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="ghost" size="sm" className="justify-start">
                    <MessageSquare className="mr-2 h-3 w-3" />
                    Message Tech
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start">
                    <DollarSign className="mr-2 h-3 w-3" />
                    Request Quote
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start">
                    <AlertTriangle className="mr-2 h-3 w-3" />
                    Report Issue
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start">
                    <Eye className="mr-2 h-3 w-3" />
                    View All Messages
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule Overview with Management Controls */}
      <Card className="servicepro-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Weekly Schedule Overview</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Edit Schedule
              </Button>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Job
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-7 gap-4">
            {/* Monday */}
            <div className="p-3 border border-slate-200 rounded-lg">
              <p className="font-medium text-slate-800 text-sm mb-2">Monday</p>
              <div className="space-y-2">
                <div className="p-2 bg-blue-50 rounded text-xs">
                  <p className="font-medium text-blue-800">Paint - 102B</p>
                  <p className="text-blue-600">9:00 AM</p>
                </div>
                <div className="p-2 bg-green-50 rounded text-xs">
                  <p className="font-medium text-green-800">Clean - 205</p>
                  <p className="text-green-600">2:00 PM</p>
                </div>
              </div>
            </div>

            {/* Tuesday */}
            <div className="p-3 border border-slate-200 rounded-lg">
              <p className="font-medium text-slate-800 text-sm mb-2">Tuesday</p>
              <div className="space-y-2">
                <div className="p-2 bg-purple-50 rounded text-xs">
                  <p className="font-medium text-purple-800">Repairs - 301</p>
                  <p className="text-purple-600">10:00 AM</p>
                </div>
              </div>
            </div>

            {/* Wednesday */}
            <div className="p-3 border border-slate-200 rounded-lg">
              <p className="font-medium text-slate-800 text-sm mb-2">Wednesday</p>
              <div className="space-y-2">
                <div className="p-2 bg-amber-50 rounded text-xs">
                  <p className="font-medium text-amber-800">Inspect - 102B</p>
                  <p className="text-amber-600">11:00 AM</p>
                </div>
                <div className="p-2 bg-blue-50 rounded text-xs">
                  <p className="font-medium text-blue-800">Paint - 402</p>
                  <p className="text-blue-600">1:00 PM</p>
                </div>
              </div>
            </div>

            {/* Thursday */}
            <div className="p-3 border border-slate-200 rounded-lg">
              <p className="font-medium text-slate-800 text-sm mb-2">Thursday</p>
              <div className="space-y-2">
                <div className="p-2 bg-green-50 rounded text-xs">
                  <p className="font-medium text-green-800">Clean - 301</p>
                  <p className="text-green-600">9:00 AM</p>
                </div>
              </div>
            </div>

            {/* Friday */}
            <div className="p-3 border border-slate-200 rounded-lg">
              <p className="font-medium text-slate-800 text-sm mb-2">Friday</p>
              <div className="space-y-2">
                <div className="p-2 bg-slate-100 rounded text-xs border-2 border-dashed border-slate-300">
                  <p className="text-slate-500 text-center">Available</p>
                </div>
              </div>
            </div>

            {/* Saturday */}
            <div className="p-3 border border-slate-200 rounded-lg">
              <p className="font-medium text-slate-800 text-sm mb-2">Saturday</p>
              <div className="space-y-2">
                <div className="p-2 bg-red-50 rounded text-xs">
                  <p className="font-medium text-red-800">Emergency</p>
                  <p className="text-red-600">On Call</p>
                </div>
              </div>
            </div>

            {/* Sunday */}
            <div className="p-3 border border-slate-200 rounded-lg">
              <p className="font-medium text-slate-800 text-sm mb-2">Sunday</p>
              <div className="space-y-2">
                <div className="p-2 bg-slate-100 rounded text-xs border-2 border-dashed border-slate-300">
                  <p className="text-slate-500 text-center">Rest Day</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
          <div className="space-y-4">
            {workOrders?.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Wrench className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p>No work orders yet</p>
                <p className="text-sm">Work orders will appear here when created</p>
              </div>
            ) : (
              workOrders?.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Wrench className="text-amber-600 text-sm" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{order.title}</p>
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
              ))
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
              data-testid="button-create-work-order"
            >
              <Wrench className="text-blue-600" size={20} />
              <span className="text-sm font-medium">Create Work Order</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              data-testid="button-schedule-maintenance"
            >
              <Calendar className="text-emerald-600" size={20} />
              <span className="text-sm font-medium">Schedule Maintenance</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              data-testid="button-view-reports"
            >
              <TrendingUp className="text-purple-600" size={20} />
              <span className="text-sm font-medium">View Reports</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              data-testid="button-inspect-property"
            >
              <Eye className="text-amber-600" size={20} />
              <span className="text-sm font-medium">Inspect Property</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Callback Request Modal */}
      <Dialog open={isCallbackModalOpen} onOpenChange={setIsCallbackModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Callback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedJobForCallback && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-medium text-sm">{selectedJobForCallback.title}</p>
                <p className="text-xs text-slate-600">Completed Job #{selectedJobForCallback.id?.slice(0, 8)}</p>
              </div>
            )}
            
            <div>
              <Label htmlFor="callback-reason">Reason for Callback *</Label>
              <Select 
                value={callbackRequestForm.reason} 
                onValueChange={(value) => setCallbackRequestForm({...callbackRequestForm, reason: value})}
              >
                <SelectTrigger data-testid="select-callback-reason">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality-issue">Quality Issue</SelectItem>
                  <SelectItem value="incomplete-work">Incomplete Work</SelectItem>
                  <SelectItem value="damage-found">Damage Found</SelectItem>
                  <SelectItem value="missed-area">Missed Area</SelectItem>
                  <SelectItem value="touch-up-needed">Touch-up Needed</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="callback-description">Description *</Label>
              <Textarea
                id="callback-description"
                placeholder="Describe the issue requiring a callback..."
                value={callbackRequestForm.description}
                onChange={(e) => setCallbackRequestForm({...callbackRequestForm, description: e.target.value})}
                data-testid="textarea-callback-description"
              />
            </div>

            <div>
              <Label htmlFor="callback-priority">Priority</Label>
              <Select 
                value={callbackRequestForm.priority} 
                onValueChange={(value) => setCallbackRequestForm({...callbackRequestForm, priority: value})}
              >
                <SelectTrigger data-testid="select-callback-priority">
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

            <div>
              <Label className="text-sm font-medium">Photo Evidence Required *</Label>
              <p className="text-xs text-slate-600 mb-3">Upload 2-3 photos showing the quality issue with detailed notes</p>
              
              <div className="space-y-4">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Photo {index + 1} {index < 2 ? '*' : '(Optional)'}</Label>
                      {callbackRequestForm.photos[index] && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newPhotos = [...callbackRequestForm.photos];
                            const newNotes = [...callbackRequestForm.photoNotes];
                            newPhotos[index] = null;
                            newNotes[index] = '';
                            setCallbackRequestForm({...callbackRequestForm, photos: newPhotos, photoNotes: newNotes});
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const newPhotos = [...callbackRequestForm.photos];
                            newPhotos[index] = file;
                            setCallbackRequestForm({...callbackRequestForm, photos: newPhotos});
                          }
                        }}
                        className="w-full text-sm"
                        data-testid={`input-callback-photo-${index}`}
                      />
                      
                      <Textarea
                        placeholder="Describe what this photo shows and why it requires a callback..."
                        value={callbackRequestForm.photoNotes[index]}
                        onChange={(e) => {
                          const newNotes = [...callbackRequestForm.photoNotes];
                          newNotes[index] = e.target.value;
                          setCallbackRequestForm({...callbackRequestForm, photoNotes: newNotes});
                        }}
                        rows={2}
                        className="text-sm"
                        data-testid={`textarea-callback-note-${index}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCallbackModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCallbackRequest}
                disabled={
                  !callbackRequestForm.reason || 
                  !callbackRequestForm.description ||
                  !callbackRequestForm.photos[0] ||
                  !callbackRequestForm.photos[1] ||
                  !callbackRequestForm.photoNotes[0].trim() ||
                  !callbackRequestForm.photoNotes[1].trim()
                }
                data-testid="button-submit-callback"
              >
                Submit Callback Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}