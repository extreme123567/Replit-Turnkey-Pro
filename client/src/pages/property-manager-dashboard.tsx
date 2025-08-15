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
  Send
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