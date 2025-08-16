import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  TrendingUp,
  PhoneCall,
  Upload,
  X,
  Play,
  Square
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for inspection dialog
  const [inspectionDialogOpen, setInspectionDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [inspectionStatus, setInspectionStatus] = useState<"pass" | "callback" | "">("");
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [callbackNotes, setCallbackNotes] = useState("");
  const [activeTimers, setActiveTimers] = useState<{[jobId: string]: {startTime: Date, elapsedSeconds: number}}>({});
  const [timerIntervals, setTimerIntervals] = useState<{[jobId: string]: NodeJS.Timeout}>({});

  // Timer functions
  const startTimer = (jobId: string) => {
    const startTime = new Date();
    setActiveTimers(prev => ({
      ...prev,
      [jobId]: { startTime, elapsedSeconds: 0 }
    }));

    const interval = setInterval(() => {
      setActiveTimers(prev => ({
        ...prev,
        [jobId]: {
          ...prev[jobId],
          elapsedSeconds: Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
        }
      }));
    }, 1000);

    setTimerIntervals(prev => ({
      ...prev,
      [jobId]: interval
    }));
  };

  const stopTimer = (jobId: string) => {
    if (timerIntervals[jobId]) {
      clearInterval(timerIntervals[jobId]);
      setTimerIntervals(prev => {
        const newIntervals = { ...prev };
        delete newIntervals[jobId];
        return newIntervals;
      });
    }
  };

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timerIntervals).forEach(interval => clearInterval(interval));
    };
  }, [timerIntervals]);

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

  // Fetch jobs that need inspection
  const { data: jobsForInspection, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs/for-inspection", inspectorId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/for-inspection/${inspectorId}`);
      if (!response.ok) throw new Error('Failed to fetch jobs for inspection');
      return response.json();
    },
  });

  // Mutation for completing inspection with photos
  const completeInspectionMutation = useMutation({
    mutationFn: async (data: {
      jobId: string;
      status: "pass" | "callback";
      notes: string;
      photos: string[];
      callbackNotes?: string;
    }) => {
      return apiRequest(`/api/jobs/${data.jobId}/inspect`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Inspection Complete",
        description: "Job inspection has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/for-inspection"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/inspector"] });
      setInspectionDialogOpen(false);
      resetInspectionForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit inspection. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetInspectionForm = () => {
    setSelectedJob(null);
    setInspectionStatus("");
    setInspectionNotes("");
    setCallbackNotes("");
    setUploadedPhotos([]);
  };

  const handleGetUploadParameters = async () => {
    const response = await fetch("/api/objects/upload", {
      method: "POST",
    });
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handlePhotoUploadComplete = (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const newPhotoUrls = result.successful.map((file: any) => file.uploadURL);
      setUploadedPhotos(prev => [...prev, ...newPhotoUrls]);
      toast({
        title: "Photos Uploaded",
        description: `${result.successful.length} photo(s) uploaded successfully.`,
      });
    }
  };

  const handleSubmitInspection = () => {
    if (!selectedJob || !inspectionStatus) return;
    
    if (inspectionStatus === "callback" && !callbackNotes.trim()) {
      toast({
        title: "Callback Notes Required",
        description: "Please provide notes explaining why this job needs a callback.",
        variant: "destructive",
      });
      return;
    }

    completeInspectionMutation.mutate({
      jobId: selectedJob.id,
      status: inspectionStatus,
      notes: inspectionNotes,
      photos: uploadedPhotos,
      callbackNotes: inspectionStatus === "callback" ? callbackNotes : undefined,
    });
  };

  const openInspectionDialog = (job: any) => {
    setSelectedJob(job);
    setInspectionDialogOpen(true);
  };

  const isLoading = statsLoading || inspectionsLoading || todayLoading || reportsLoading || jobsLoading;

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

      {/* Jobs for Inspection */}
      <Card className="servicepro-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Jobs Ready for Inspection</span>
            <Badge variant="outline" className="text-blue-600">
              {jobsForInspection?.length || 0} jobs
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {jobsForInspection?.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Clipboard className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p>No jobs ready for inspection</p>
                <p className="text-sm">Completed jobs will appear here when ready for inspection</p>
              </div>
            ) : (
              jobsForInspection?.map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Building className="text-emerald-600 text-sm" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{job.jobType} - {job.unit}</p>
                      <p className="text-sm text-slate-600">{job.property}</p>
                      <p className="text-sm text-slate-600">
                        Completed by: {job.technicianName} • {new Date(job.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge className="bg-emerald-100 text-emerald-800">Ready for Inspection</Badge>
                    
                    {/* Timer Display */}
                    {activeTimers[job.id] && (
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-mono">
                        ⏱️ {formatElapsedTime(activeTimers[job.id].elapsedSeconds)}
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      {/* Timer Controls */}
                      {activeTimers[job.id] ? (
                        <Button 
                          size="sm"
                          onClick={() => stopTimer(job.id)}
                          className="bg-red-600 hover:bg-red-700"
                          data-testid={`button-stop-timer-${job.id}`}
                        >
                          <Square className="mr-1" size={12} />
                          Stop
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => startTimer(job.id)}
                          className="bg-green-600 hover:bg-green-700"
                          data-testid={`button-start-timer-${job.id}`}
                        >
                          <Play className="mr-1" size={12} />
                          Start
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        onClick={() => openInspectionDialog(job)}
                        className="bg-blue-600 hover:bg-blue-700"
                        data-testid={`button-inspect-${job.id}`}
                      >
                        <Search className="mr-1" size={12} />
                        Inspect
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

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

      {/* Inspection Dialog */}
      <Dialog open={inspectionDialogOpen} onOpenChange={setInspectionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Inspect Job: {selectedJob?.jobType} - {selectedJob?.unit}
            </DialogTitle>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-6">
              {/* Job Details */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">Job Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Property:</p>
                    <p className="font-medium">{selectedJob.property}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Unit:</p>
                    <p className="font-medium">{selectedJob.unit}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Job Type:</p>
                    <p className="font-medium">{selectedJob.jobType}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Completed By:</p>
                    <p className="font-medium">{selectedJob.technicianName}</p>
                  </div>
                </div>
              </div>

              {/* Inspection Status */}
              <div>
                <Label className="text-base font-medium">Inspection Result</Label>
                <Select value={inspectionStatus} onValueChange={(value: "pass" | "callback") => setInspectionStatus(value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select inspection result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pass">✅ Pass - Job Approved</SelectItem>
                    <SelectItem value="callback">⚠️ Callback Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Photo Upload */}
              <div>
                <Label className="text-base font-medium">Upload Photos</Label>
                <p className="text-sm text-slate-600 mb-3">
                  {inspectionStatus === "pass" 
                    ? "Upload photos to document the completed work" 
                    : "Upload photos showing issues that need to be addressed"
                  }
                </p>
                
                <ObjectUploader
                  maxNumberOfFiles={10}
                  maxFileSize={10485760} // 10MB
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handlePhotoUploadComplete}
                  buttonClassName="w-full"
                >
                  <div className="flex items-center space-x-2">
                    <Upload size={16} />
                    <span>Upload Photos</span>
                  </div>
                </ObjectUploader>
                
                {uploadedPhotos.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Uploaded Photos ({uploadedPhotos.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {uploadedPhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <div className="w-16 h-16 bg-slate-100 border rounded-lg flex items-center justify-center">
                            <Camera size={16} className="text-slate-400" />
                          </div>
                          <button
                            onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* General Notes */}
              <div>
                <Label htmlFor="inspectionNotes" className="text-base font-medium">
                  Inspection Notes
                </Label>
                <Textarea
                  id="inspectionNotes"
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder="Add any general notes about the inspection..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* Callback Section */}
              {inspectionStatus === "callback" && (
                <div className="border border-amber-200 bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <PhoneCall className="text-amber-600" size={20} />
                    <h4 className="font-medium text-amber-800">Callback Information</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="callbackNotes" className="font-medium text-amber-800">
                        Callback Notes *
                      </Label>
                      <Textarea
                        id="callbackNotes"
                        value={callbackNotes}
                        onChange={(e) => setCallbackNotes(e.target.value)}
                        placeholder="Describe what needs to be fixed or redone. This will be sent to the office staff and the technician who completed the job."
                        className="mt-2 border-amber-200"
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div className="bg-amber-100 p-3 rounded border border-amber-200">
                      <p className="text-sm font-medium text-amber-800 mb-1">
                        Callback Process:
                      </p>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>• Office staff will be immediately notified</li>
                        <li>• The technician ({selectedJob?.technicianName}) will receive the callback</li>
                        <li>• Photos and notes will be attached to the notification</li>
                        <li>• Job will be rescheduled for correction</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setInspectionDialogOpen(false);
                    resetInspectionForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitInspection}
                  disabled={!inspectionStatus || completeInspectionMutation.isPending}
                  className={inspectionStatus === "pass" ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"}
                >
                  {completeInspectionMutation.isPending ? "Submitting..." : 
                   inspectionStatus === "pass" ? "Mark Completed" : "Submit Callback"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}