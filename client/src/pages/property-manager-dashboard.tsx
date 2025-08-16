import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  PackageX
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  // For demo, we'll use a mock property manager ID
  const propertyManagerId = "pm-1";
  
  // Modal states
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  
  // Filter state for jobs
  const [jobFilter, setJobFilter] = useState("all"); // all, scheduled, in_progress, completed
  
  // Form states
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    property: '',
    priority: 'medium',
    scheduledDate: '',
    estimatedHours: ''
  });
  
  const [messageForm, setMessageForm] = useState({
    recipient: '',
    subject: '',
    message: ''
  });

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
              <QuoteRequestForm onSuccess={() => setIsQuoteModalOpen(false)} />
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
              <MessageForm onSuccess={() => setIsMessageModalOpen(false)} />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
            <DialogTrigger asChild>
              <Button className="servicepro-btn-primary" data-testid="button-schedule-job">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Schedule New Job</DialogTitle>
              </DialogHeader>
              <JobScheduleForm onSuccess={() => setIsJobModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Properties</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-total-properties">
                  {stats?.totalProperties || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="text-blue-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">{stats?.totalUnits || 0} total units</p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Occupancy Rate</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-occupancy-rate">
                  {stats?.occupancyRate || '0.0'}%
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="text-emerald-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {stats?.occupiedUnits || 0} of {stats?.totalUnits || 0} units occupied
            </p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Monthly Revenue</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-monthly-revenue">
                  ${stats?.monthlyRent || '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-purple-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Active leases</p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Open Work Orders</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-open-work-orders">
                  {stats?.openWorkOrders || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Wrench className="text-amber-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {stats?.emergencyWorkOrders || 0} emergency priority
            </p>
          </CardContent>
        </Card>
      </div>

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
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                    Reject
                  </Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    Approve
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
                  <Button size="sm" variant="outline" className="text-xs">
                    View Photos
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                    Reject
                  </Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    Approve
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

      {/* Job Scheduling and Progress Tracking */}
      <Card className="servicepro-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Job Schedule & Progress</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-blue-600">
                Today: 3 jobs
              </Badge>
              <Badge variant="outline" className="text-green-600">
                In Progress: 2 jobs
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {/* Job Timeline View */}
            <div className="space-y-3">
              {/* Scheduled Job - Punch */}
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Punch List - Unit 304</p>
                      <p className="text-sm text-slate-600">Touch-ups and final details • Est. 2 hours</p>
                      <p className="text-xs text-blue-600 mt-1">Scheduled: Today 2:00 PM</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-100 text-blue-800">Punch - Scheduled</Badge>
                    <p className="text-xs text-slate-500 mt-1">Tech: Mike Johnson</p>
                  </div>
                </div>
              </div>

              {/* Repairs Job in Progress */}
              <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Clock className="text-amber-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Repairs - Unit 205</p>
                      <p className="text-sm text-slate-600">Kitchen faucet and cabinet door fix</p>
                      <p className="text-xs text-amber-600 mt-1">Started: 1:30 PM • 1.5 hrs elapsed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-amber-100 text-amber-800">Repairs - In Progress</Badge>
                    <p className="text-xs text-slate-500 mt-1">Tech: Sarah Wilson</p>
                  </div>
                </div>
                <div className="mt-3 bg-white/60 rounded p-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Phase: Installing new faucet</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div className="bg-amber-500 h-2 rounded-full" style={{width: '65%'}}></div>
                  </div>
                </div>
              </div>

              {/* Paint Job in Progress */}
              <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="text-purple-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Paint - Unit 301</p>
                      <p className="text-sm text-slate-600">Living room and bedroom walls</p>
                      <p className="text-xs text-purple-600 mt-1">Started: 9:00 AM • 5 hrs elapsed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-purple-100 text-purple-800">Paint - In Progress</Badge>
                    <p className="text-xs text-slate-500 mt-1">Tech: Mike Johnson</p>
                  </div>
                </div>
                <div className="mt-3 bg-white/60 rounded p-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Phase: Second coat application</span>
                    <span>80%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '80%'}}></div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">✓ Prep & Prime</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-600">• Paint Walls</span>
                      <span className="text-purple-600">80%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">• Touch-ups</span>
                      <span className="text-slate-400">Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clean Job in Progress */}
              <div className="p-4 border border-teal-200 bg-teal-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Clock className="text-teal-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Clean - Unit 402</p>
                      <p className="text-sm text-slate-600">Deep clean after renovation</p>
                      <p className="text-xs text-teal-600 mt-1">Started: 8:00 AM • 6.5 hrs elapsed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-teal-100 text-teal-800">Clean - In Progress</Badge>
                    <p className="text-xs text-slate-500 mt-1">Tech: David Lee</p>
                  </div>
                </div>
                <div className="mt-3 bg-white/60 rounded p-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Phase: Kitchen and bathroom scrub</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div className="bg-teal-500 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">✓ Dusting & Vacuuming</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-teal-600">• Deep Scrub</span>
                      <span className="text-teal-600">75%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">• Final Polish</span>
                      <span className="text-slate-400">Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carpet Job in Progress */}
              <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="text-orange-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Carpet - Unit 150</p>
                      <p className="text-sm text-slate-600">Bedroom and hallway installation</p>
                      <p className="text-xs text-orange-600 mt-1">Started: 7:00 AM • 4.5 hrs elapsed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-orange-100 text-orange-800">Carpet - In Progress</Badge>
                    <p className="text-xs text-slate-500 mt-1">Tech: Alex Chen</p>
                  </div>
                </div>
                <div className="mt-3 bg-white/60 rounded p-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Phase: Installing hallway carpet</span>
                    <span>70%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '70%'}}></div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">✓ Prep & Measure</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">✓ Bedroom Install</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-orange-600">• Hallway Install</span>
                      <span className="text-orange-600">70%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">• Final Trim</span>
                      <span className="text-slate-400">Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Unit Trash Out Job */}
              <div className="p-4 border border-slate-200 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Clock className="text-slate-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Unit Trash Out - Unit 305</p>
                      <p className="text-sm text-slate-600">Remove all debris and personal items</p>
                      <p className="text-xs text-slate-600 mt-1">Started: 10:00 AM • 3 hrs elapsed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-slate-100 text-slate-800">Trash Out - In Progress</Badge>
                    <p className="text-xs text-slate-500 mt-1">Tech: Carlos Martinez</p>
                  </div>
                </div>
                <div className="mt-3 bg-white/60 rounded p-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Phase: Removing large furniture</span>
                    <span>60%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div className="bg-slate-500 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">✓ Initial Assessment</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">• Furniture Removal</span>
                      <span className="text-slate-600">60%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">• 2 Photos Required</span>
                      <span className="text-slate-400">Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Onsite Bulk Trash Job */}
              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="text-yellow-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Onsite Bulk Trash - Building B</p>
                      <p className="text-sm text-slate-600">Large item disposal from common areas</p>
                      <p className="text-xs text-yellow-600 mt-1">Started: 1:00 PM • 2 hrs elapsed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-yellow-100 text-yellow-800">Bulk Trash - In Progress</Badge>
                    <p className="text-xs text-slate-500 mt-1">Tech: Jennifer Kim</p>
                  </div>
                </div>
                <div className="mt-3 bg-white/60 rounded p-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Phase: Loading dumpster</span>
                    <span>80%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '80%'}}></div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">✓ Item Collection</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-yellow-600">• Loading & Disposal</span>
                      <span className="text-yellow-600">80%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">• 2 Photos to Office</span>
                      <span className="text-slate-400">Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inspected Job - Completed */}
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="text-green-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Inspected - Unit 102</p>
                      <p className="text-sm text-slate-600">Final quality inspection</p>
                      <p className="text-xs text-green-600 mt-1">Completed: 2:30 PM • Total: 6 hrs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">Inspected - Complete</Badge>
                    <p className="text-xs text-slate-500 mt-1">Inspector: Maria Rodriguez</p>
                  </div>
                </div>
                <div className="mt-3 bg-white/60 rounded p-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Status: Passed all quality checks</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">✓ Safety Check</span>
                      <span className="text-green-600">Passed</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">✓ Quality Review</span>
                      <span className="text-green-600">Passed</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">✓ Documentation</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      View Report
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                      Approve Unit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Overview and Work Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Properties List */}
        <Card className="servicepro-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>My Properties</span>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {properties?.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Building className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p>No properties assigned</p>
                  <p className="text-sm">Properties will appear here when assigned to you</p>
                </div>
              ) : (
                properties?.slice(0, 5).map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="text-blue-600 text-sm" size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{property.name}</p>
                        <p className="text-sm text-slate-600 flex items-center">
                          <MapPin className="mr-1" size={12} />
                          {property.city}, {property.state}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-800">{property.units} units</p>
                      <p className="text-sm text-slate-600">${property.monthlyRent}/mo</p>
                    </div>
                  </div>
                ))
              )}
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
      </div>

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

      {/* Properties Overview and Recent Work Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
      </div>

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

      {/* Job Scheduling Modal */}
      <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule New Job</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                placeholder="e.g., Repair leaky faucet"
                value={jobForm.title}
                onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="job-description">Description</Label>
              <Textarea
                id="job-description"
                placeholder="Describe the work needed..."
                value={jobForm.description}
                onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={jobForm.priority} onValueChange={(value) => setJobForm({...jobForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estimated-hours">Estimated Hours</Label>
                <Input
                  id="estimated-hours"
                  type="number"
                  placeholder="2.5"
                  value={jobForm.estimatedHours}
                  onChange={(e) => setJobForm({...jobForm, estimatedHours: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="scheduled-date">Scheduled Date</Label>
              <Input
                id="scheduled-date"
                type="datetime-local"
                value={jobForm.scheduledDate}
                onChange={(e) => setJobForm({...jobForm, scheduledDate: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsJobModalOpen(false)}>
                Cancel
              </Button>
              <Button className="servicepro-btn-primary">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Job
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Messaging Modal */}
      <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Message Office Staff</DialogTitle>
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
                  <SelectItem value="leasing-coordinator">Leasing Coordinator</SelectItem>
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
                rows={5}
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

      {/* Quote Request Modal */}
      <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Request Quote from Office</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quote-title">Service Title</Label>
              <Input
                id="quote-title"
                placeholder="e.g., Kitchen renovation - Unit 205"
                value={quoteForm.title}
                onChange={(e) => setQuoteForm({...quoteForm, title: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quote-description">Detailed Description</Label>
              <Textarea
                id="quote-description"
                placeholder="Describe the work needed in detail, including materials and scope..."
                rows={4}
                value={quoteForm.description}
                onChange={(e) => setQuoteForm({...quoteForm, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="property">Property</Label>
                <Select value={quoteForm.property} onValueChange={(value) => setQuoteForm({...quoteForm, property: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maple-gardens">Maple Gardens Apartments</SelectItem>
                    <SelectItem value="oak-village">Oak Village Townhomes</SelectItem>
                    <SelectItem value="pine-heights">Pine Heights Complex</SelectItem>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Service Category</Label>
                <Select value={quoteForm.category} onValueChange={(value) => setQuoteForm({...quoteForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="renovation">Renovation</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="landscaping">Landscaping</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={quoteForm.priority} onValueChange={(value) => setQuoteForm({...quoteForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estimated-budget">Estimated Budget (Optional)</Label>
              <Input
                id="estimated-budget"
                type="number"
                placeholder="5000"
                value={quoteForm.estimatedBudget}
                onChange={(e) => setQuoteForm({...quoteForm, estimatedBudget: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="preferred-start">Preferred Start Date</Label>
                <Input
                  id="preferred-start"
                  type="date"
                  value={quoteForm.preferredStartDate}
                  onChange={(e) => setQuoteForm({...quoteForm, preferredStartDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="preferred-end">Preferred Completion</Label>
                <Input
                  id="preferred-end"
                  type="date"
                  value={quoteForm.preferredEndDate}
                  onChange={(e) => setQuoteForm({...quoteForm, preferredEndDate: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsQuoteModalOpen(false)}>
                Cancel
              </Button>
              <Button className="servicepro-btn-primary">
                <DollarSign className="mr-2 h-4 w-4" />
                Submit Quote Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}