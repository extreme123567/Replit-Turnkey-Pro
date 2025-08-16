import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  RotateCcw,
  Target,
  Activity
} from "lucide-react";

interface DashboardStats {
  scheduledJobs: number;
  activeJobs: number;
  completedAndInspected: number;
  revenueBilled: string;
  totalPayout: string;
  netProfit: string;
  profitMargin: number;
  currentPeriod: {
    startDate: string;
    endDate: string;
    daysRemaining: number;
  };
}

export default function GeneralDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/general-stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Unable to load dashboard data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getProfitColor = (margin: number) => {
    if (margin >= 30) return "text-emerald-600";
    if (margin >= 15) return "text-yellow-600";
    return "text-red-600";
  };

  const getProfitBadgeColor = (margin: number) => {
    if (margin >= 30) return "bg-emerald-100 text-emerald-800";
    if (margin >= 15) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">General Dashboard</h1>
          <p className="text-gray-600">
            Bi-weekly reporting period: {new Date(stats.currentPeriod.startDate).toLocaleDateString()} - {new Date(stats.currentPeriod.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="px-3 py-1">
            <Clock className="mr-1" size={14} />
            {stats.currentPeriod.daysRemaining} days remaining
          </Badge>
          <Button variant="outline" size="sm" data-testid="button-refresh-stats">
            <RotateCcw size={14} className="mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scheduled Jobs */}
        <Card data-testid="card-scheduled-jobs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Scheduled Jobs</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-scheduled-count">
              {stats.scheduledJobs}
            </div>
            <p className="text-xs text-gray-500 mt-1">Jobs awaiting execution</p>
          </CardContent>
        </Card>

        {/* Active Jobs */}
        <Card data-testid="card-active-jobs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Jobs</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="text-active-count">
              {stats.activeJobs}
            </div>
            <p className="text-xs text-gray-500 mt-1">Currently in progress</p>
          </CardContent>
        </Card>

        {/* Completed & Inspected */}
        <Card data-testid="card-completed-jobs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed & Inspected</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600" data-testid="text-completed-count">
              {stats.completedAndInspected}
            </div>
            <p className="text-xs text-gray-500 mt-1">Finished this period</p>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card data-testid="card-net-profit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
            <TrendingUp className={`h-4 w-4 ${getProfitColor(stats.profitMargin)}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getProfitColor(stats.profitMargin)}`} data-testid="text-net-profit">
              ${stats.netProfit}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">This period</p>
              <Badge variant="outline" className={getProfitBadgeColor(stats.profitMargin)}>
                {stats.profitMargin.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Card */}
        <Card data-testid="card-revenue-breakdown">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 text-emerald-600" size={20} />
              Revenue Billed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 mb-2" data-testid="text-revenue-billed">
              ${stats.revenueBilled}
            </div>
            <p className="text-sm text-gray-600">Total billed this period</p>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Per Day Average:</span>
                <span className="font-medium">
                  ${(parseFloat(stats.revenueBilled) / 14).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payout Card */}
        <Card data-testid="card-payout-breakdown">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 text-red-600" size={20} />
              Total Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 mb-2" data-testid="text-total-payout">
              ${stats.totalPayout}
            </div>
            <p className="text-sm text-gray-600">Total paid out this period</p>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Per Day Average:</span>
                <span className="font-medium">
                  ${(parseFloat(stats.totalPayout) / 14).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Reset Notice */}
      <Card className="border-dashed border-gray-300 bg-gray-50" data-testid="card-reset-notice">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center text-center">
            <div>
              <AlertTriangle className="mx-auto mb-2 text-amber-600" size={24} />
              <h3 className="font-medium text-gray-900 mb-1">Bi-Weekly Reset</h3>
              <p className="text-sm text-gray-600">
                All financial metrics reset every 2 weeks on {new Date(stats.currentPeriod.endDate).toLocaleDateString()}.
                Job counts and revenue tracking will restart for the next period.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}