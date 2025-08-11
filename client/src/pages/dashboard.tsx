import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  DollarSign, 
  Users, 
  Clock, 
  ArrowUpIcon, 
  ArrowDownIcon,
  Plus,
  UserPlus,
  File,
  Calculator,
  Wrench,
  Hammer,
  PaintBucket
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  activeJobs: number;
  revenue: string;
  clients: number;
  staffHours: string;
  recentJobs: any[];
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-4" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getJobIcon = (title: string) => {
    if (title.toLowerCase().includes('plumb') || title.toLowerCase().includes('kitchen')) {
      return <Wrench className="text-blue-600 text-sm" size={16} />;
    }
    if (title.toLowerCase().includes('deck') || title.toLowerCase().includes('install')) {
      return <Hammer className="text-emerald-600 text-sm" size={16} />;
    }
    if (title.toLowerCase().includes('paint')) {
      return <PaintBucket className="text-purple-600 text-sm" size={16} />;
    }
    return <Wrench className="text-blue-600 text-sm" size={16} />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-amber-100 text-amber-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress': return 'In Progress';
      case 'scheduled': return 'Scheduled';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Active Jobs</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-active-jobs">
                  {stats?.activeJobs || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="text-blue-600" size={20} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpIcon className="text-emerald-500 mr-1" size={16} />
              <span className="text-emerald-500 font-medium">+12%</span>
              <span className="text-slate-600 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Revenue</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-revenue">
                  ${stats?.revenue || '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-emerald-600" size={20} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpIcon className="text-emerald-500 mr-1" size={16} />
              <span className="text-emerald-500 font-medium">+8.2%</span>
              <span className="text-slate-600 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Clients</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-clients">
                  {stats?.clients || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Users className="text-amber-600" size={20} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpIcon className="text-emerald-500 mr-1" size={16} />
              <span className="text-emerald-500 font-medium">+5</span>
              <span className="text-slate-600 ml-1">new this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Staff Hours</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-staff-hours">
                  {stats?.staffHours || '0.0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="text-purple-600" size={20} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowDownIcon className="text-red-500 mr-1" size={16} />
              <span className="text-red-500 font-medium">-3.1%</span>
              <span className="text-slate-600 ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 servicepro-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Recent Jobs</h3>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {stats?.recentJobs?.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Briefcase className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p>No jobs scheduled yet</p>
                <p className="text-sm">Create your first job to get started</p>
              </div>
            ) : (
              stats?.recentJobs?.map((job, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {getJobIcon(job.title)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{job.title}</p>
                      <p className="text-sm text-slate-600">Job #{job.id?.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(job.status)}>
                      {getStatusText(job.status)}
                    </Badge>
                    <p className="text-sm text-slate-600 mt-1">
                      Due: {new Date(job.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="servicepro-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start p-3 h-auto"
              data-testid="button-schedule-job"
            >
              <Plus className="text-blue-600 mr-3" size={16} />
              <span className="font-medium text-slate-800">Schedule New Job</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start p-3 h-auto"
              data-testid="button-add-client"
            >
              <UserPlus className="text-emerald-600 mr-3" size={16} />
              <span className="font-medium text-slate-800">Add New Client</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start p-3 h-auto"
              data-testid="button-create-invoice"
            >
              <File className="text-amber-600 mr-3" size={16} />
              <span className="font-medium text-slate-800">Create Invoice</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start p-3 h-auto"
              data-testid="button-process-payroll"
            >
              <Calculator className="text-purple-600 mr-3" size={16} />
              <span className="font-medium text-slate-800">Process Payroll</span>
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Today's Schedule</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">No jobs scheduled</span>
                <span className="text-blue-600">0 hrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
