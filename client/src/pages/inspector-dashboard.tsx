import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Calendar, 
  CheckCircle, 
  MapPin,
  Camera,
  FileText,
  AlertTriangle,
  Plus,
  Clock,
  Building,
  Clipboard,
  Star,
  TrendingUp
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface InspectorStats {
  scheduledInspections: number;
  completedThisWeek: number;
  pendingReports: number;
  complianceIssues: number;
  todaysInspections: any[];
}

export default function InspectorDashboard() {
  // For demo, we'll use a mock inspector ID
  const inspectorId = "inspector-1";

  const { data: stats, isLoading: statsLoading } = useQuery<InspectorStats>({
    queryKey: ["/api/dashboard/inspector", inspectorId],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/inspector/${inspectorId}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const { data: scheduledInspections, isLoading: inspectionsLoading } = useQuery({
    queryKey: ["/api/inspections/inspector", inspectorId],
    queryFn: async () => {
      const response = await fetch(`/api/inspections/inspector/${inspectorId}`);
      if (!response.ok) throw new Error('Failed to fetch inspections');
      return response.json();
    },
  });

  const { data: todaysInspections, isLoading: todayLoading } = useQuery({
    queryKey: ["/api/inspections/today", inspectorId],
    queryFn: async () => {
      const response = await fetch(`/api/inspections/today/${inspectorId}`);
      if (!response.ok) throw new Error('Failed to fetch today\'s inspections');
      return response.json();
    },
  });

  const { data: pendingReports, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/inspections/pending-reports", inspectorId],
    queryFn: async () => {
      const response = await fetch(`/api/inspections/pending-reports/${inspectorId}`);
      if (!response.ok) throw new Error('Failed to fetch pending reports');
      return response.json();
    },
  });

  const isLoading = statsLoading || inspectionsLoading || todayLoading || reportsLoading;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-emerald-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-amber-600';
      case 'poor': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          <h2 className="text-3xl font-bold text-slate-800">Inspector Dashboard</h2>
          <p className="text-slate-600">Manage property inspections and compliance oversight</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button className="servicepro-btn-primary" data-testid="button-new-inspection">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Inspection
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Scheduled Inspections</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-scheduled-inspections">
                  {stats?.scheduledInspections || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="text-blue-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Upcoming inspections</p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Completed This Week</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-completed-week">
                  {stats?.completedThisWeek || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Inspections finished</p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pending Reports</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-pending-reports">
                  {stats?.pendingReports || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="text-amber-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Reports to complete</p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Compliance Issues</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-compliance-issues">
                  {stats?.complianceIssues || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule and Pending Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Inspections */}
        <Card className="servicepro-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Today's Schedule</span>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View Calendar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {todaysInspections?.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p>No inspections scheduled today</p>
                  <p className="text-sm">Enjoy a lighter schedule!</p>
                </div>
              ) : (
                todaysInspections?.slice(0, 5).map((inspection: any) => (
                  <div key={inspection.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Search className="text-blue-600 text-sm" size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{inspection.inspectionType}</p>
                        <p className="text-sm text-slate-600 flex items-center">
                          <MapPin className="mr-1" size={12} />
                          {inspection.propertyName}
                        </p>
                        <p className="text-sm text-slate-600">
                          {formatTime(inspection.scheduledDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className={getStatusColor(inspection.status)}>
                        {inspection.status}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" className="px-2">
                          <MapPin size={12} />
                        </Button>
                        <Button size="sm" variant="outline" className="px-2">
                          <Camera size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Reports */}
        <Card className="servicepro-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Reports</span>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {pendingReports?.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p>No pending reports</p>
                  <p className="text-sm">All inspections are up to date</p>
                </div>
              ) : (
                pendingReports?.slice(0, 5).map((report: any) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-amber-600 text-sm" size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{report.inspectionType}</p>
                        <p className="text-sm text-slate-600">{report.propertyName}</p>
                        <p className="text-sm text-slate-600">
                          Completed: {new Date(report.completedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-1">
                        <Star className={`${getRatingColor(report.overallRating)} w-4 h-4`} />
                        <span className="text-sm text-slate-600">{report.overallRating}</span>
                      </div>
                      <Button size="sm" variant="outline" className="text-blue-600 border-blue-200">
                        Complete Report
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Inspections Overview */}
      <Card className="servicepro-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Upcoming Inspections</span>
            <Button variant="ghost" size="sm" className="text-blue-600">
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid gap-4">
            {scheduledInspections?.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Search className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p>No upcoming inspections</p>
                <p className="text-sm">New inspections will appear here when scheduled</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scheduledInspections?.slice(0, 6).map((inspection: any) => (
                  <div key={inspection.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="text-blue-600 text-sm" size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{inspection.inspectionType}</p>
                        <p className="text-sm text-slate-600">{inspection.propertyName}</p>
                        <p className="text-sm text-slate-600">
                          {new Date(inspection.scheduledDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className={getStatusColor(inspection.status)}>
                        {inspection.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              data-testid="button-start-inspection"
            >
              <Search className="text-blue-600" size={20} />
              <span className="text-sm font-medium">Start Inspection</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              data-testid="button-upload-photos"
            >
              <Camera className="text-emerald-600" size={20} />
              <span className="text-sm font-medium">Upload Photos</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              data-testid="button-generate-report"
            >
              <FileText className="text-purple-600" size={20} />
              <span className="text-sm font-medium">Generate Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              data-testid="button-compliance-check"
            >
              <Clipboard className="text-amber-600" size={20} />
              <span className="text-sm font-medium">Compliance Check</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="servicepro-card border-amber-200 bg-amber-50/50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-amber-600" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">Quality Standards Reminder</h3>
              <p className="text-amber-700 text-sm">
                Ensure all inspections follow company guidelines and local compliance requirements
              </p>
            </div>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" data-testid="button-view-guidelines">
              View Guidelines
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}