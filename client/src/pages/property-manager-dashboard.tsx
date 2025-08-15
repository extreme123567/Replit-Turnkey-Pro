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
  Sparkles
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

  const { data: workOrders, isLoading: workOrdersLoading } = useQuery({
    queryKey: ["/api/work-orders/manager", propertyManagerId],
    queryFn: async () => {
      const response = await fetch(`/api/work-orders/manager/${propertyManagerId}`);
      if (!response.ok) throw new Error('Failed to fetch work orders');
      return response.json();
    },
  });

  const isLoading = statsLoading || propertiesLoading || workOrdersLoading;

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
          <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-schedule-job">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Job
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-message-staff">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message Office Staff
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Button className="servicepro-btn-primary" data-testid="button-add-property">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
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

      {/* Approval Queue */}
      <Card className="servicepro-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pending Approvals</span>
            <Badge variant="secondary">
              {/* Mock count for demo */}
              2 items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {/* Mock approval items */}
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="text-amber-600" size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Extra Dirty Unit - Apt 205</p>
                    <p className="text-sm text-slate-600">Requires deep cleaning approval</p>
                    <p className="text-xs text-slate-500 mt-1">From: Office Staff • 2 hours ago</p>
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
            
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Wrench className="text-amber-600" size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">HVAC Repair - Unit 102</p>
                    <p className="text-sm text-slate-600">Est. Cost: $450 • Requires 2 photos</p>
                    <p className="text-xs text-slate-500 mt-1">From: Office Staff • 4 hours ago</p>
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
              {/* Scheduled Job */}
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">HVAC Maintenance - Building A</p>
                      <p className="text-sm text-slate-600">Unit 304 • Est. 3 hours</p>
                      <p className="text-xs text-blue-600 mt-1">Scheduled: Today 2:00 PM</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                    <p className="text-xs text-slate-500 mt-1">Tech: Mike Johnson</p>
                  </div>
                </div>
              </div>

              {/* In Progress Job - Plumbing */}
              <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Clock className="text-amber-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Plumbing Repair - Unit 205</p>
                      <p className="text-sm text-slate-600">Kitchen faucet replacement</p>
                      <p className="text-xs text-amber-600 mt-1">Started: 1:30 PM • 1.5 hrs elapsed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-amber-100 text-amber-800">Repairs in Progress</Badge>
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

              {/* Painting Job in Progress */}
              <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="text-purple-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Interior Painting - Unit 301</p>
                      <p className="text-sm text-slate-600">Living room and bedroom walls</p>
                      <p className="text-xs text-purple-600 mt-1">Started: 9:00 AM • 5 hrs elapsed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-purple-100 text-purple-800">Paint in Progress</Badge>
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
                  {/* Detailed Phase Progress */}
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
                      <span className="text-slate-400">• Trim Work</span>
                      <span className="text-slate-400">Pending</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">• Cleanup</span>
                      <span className="text-slate-400">Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trim Work in Progress */}
              <div className="p-4 border border-indigo-200 bg-indigo-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Clock className="text-indigo-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Full Renovation - Unit 402</p>
                      <p className="text-sm text-slate-600">Bathroom and kitchen refresh</p>
                      <p className="text-xs text-indigo-600 mt-1">Started: 8:00 AM • 6.5 hrs elapsed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-indigo-100 text-indigo-800">Trim in Progress</Badge>
                    <p className="text-xs text-slate-500 mt-1">Tech: David Lee</p>
                  </div>
                </div>
                <div className="mt-3 bg-white/60 rounded p-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Phase: Installing baseboards</span>
                    <span>90%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{width: '90%'}}></div>
                  </div>
                  {/* Detailed Phase Progress */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">✓ Job Started</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">✓ Repairs Complete</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">✓ Painting Complete</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-indigo-600">• Trim Work</span>
                      <span className="text-indigo-600">90%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">• Cleanup</span>
                      <span className="text-slate-400">Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cleanup in Progress */}
              <div className="p-4 border border-emerald-200 bg-emerald-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="text-emerald-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Kitchen Remodel - Unit 150</p>
                      <p className="text-sm text-slate-600">Cabinet installation and painting</p>
                      <p className="text-xs text-emerald-600 mt-1">Started: 7:00 AM • 8 hrs elapsed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-emerald-100 text-emerald-800">Cleanup in Progress</Badge>
                    <p className="text-xs text-slate-500 mt-1">Tech: Alex Chen</p>
                  </div>
                </div>
                <div className="mt-3 bg-white/60 rounded p-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Phase: Final cleanup and photos</span>
                    <span>95%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{width: '95%'}}></div>
                  </div>
                  {/* Detailed Phase Progress */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">✓ Job Started</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">✓ Repairs Complete</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">✓ Painting Complete</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">✓ Trim Complete</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-600">• Cleanup</span>
                      <span className="text-emerald-600">95%</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      View Photos
                    </Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                      Mark Complete
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

      {/* Job Status Distribution */}
      <Card className="servicepro-card">
        <CardHeader>
          <CardTitle>Job Phase Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {/* Scheduled Jobs */}
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="text-blue-600" size={16} />
              </div>
              <p className="text-lg font-bold text-slate-800">3</p>
              <p className="text-xs text-slate-600">Scheduled</p>
            </div>

            {/* Job Started */}
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="text-emerald-600" size={16} />
              </div>
              <p className="text-lg font-bold text-slate-800">2</p>
              <p className="text-xs text-slate-600">Job Started</p>
            </div>

            {/* Repairs in Progress */}
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Wrench className="text-amber-600" size={16} />
              </div>
              <p className="text-lg font-bold text-slate-800">1</p>
              <p className="text-xs text-slate-600">Repairs</p>
            </div>

            {/* Paint in Progress */}
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Palette className="text-purple-600" size={16} />
              </div>
              <p className="text-lg font-bold text-slate-800">1</p>
              <p className="text-xs text-slate-600">Painting</p>
            </div>

            {/* Trim in Progress */}
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Square className="text-indigo-600" size={16} />
              </div>
              <p className="text-lg font-bold text-slate-800">1</p>
              <p className="text-xs text-slate-600">Trim Work</p>
            </div>

            {/* Cleanup in Progress */}
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sparkles className="text-teal-600" size={16} />
              </div>
              <p className="text-lg font-bold text-slate-800">1</p>
              <p className="text-xs text-slate-600">Cleanup</p>
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
    </div>
  );
}