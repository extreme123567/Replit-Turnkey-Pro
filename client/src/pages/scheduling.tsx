import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Job, Client, Staff } from "@shared/schema";

export default function Scheduling() {
  const [viewMode, setViewMode] = useState("week");

  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: staff, isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const isLoading = jobsLoading || clientsLoading || staffLoading;

  // Get current week dates
  const getCurrentWeekDates = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getCurrentWeekDates();
  const timeSlots = ["9:00 AM", "1:00 PM", "3:00 PM"];

  const getJobsForDateTime = (date: Date, timeSlot: string) => {
    if (!jobs) return [];
    
    return jobs.filter(job => {
      const jobDate = new Date(job.scheduledDate);
      const isSameDay = jobDate.toDateString() === date.toDateString();
      
      // Simple time matching - in a real app you'd want more sophisticated time handling
      const jobHour = jobDate.getHours();
      const slotHour = timeSlot.includes('9:00') ? 9 : timeSlot.includes('1:00') ? 13 : 15;
      
      return isSameDay && Math.abs(jobHour - slotHour) < 2;
    });
  };

  const getClientName = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-amber-100 border-amber-500 text-amber-900';
      case 'scheduled': return 'bg-blue-100 border-blue-500 text-blue-900';
      case 'completed': return 'bg-emerald-100 border-emerald-500 text-emerald-900';
      default: return 'bg-slate-100 border-slate-500 text-slate-900';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Calendar View</h3>
          <p className="text-slate-600">Manage your service appointments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
              <SelectItem value="day">Day View</SelectItem>
            </SelectContent>
          </Select>
          <Button className="servicepro-btn-primary" data-testid="button-new-appointment">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="servicepro-card overflow-hidden">
        <div className="grid grid-cols-8 border-b border-slate-200">
          <div className="p-4 text-center font-medium text-slate-600 border-r border-slate-200">
            Time
          </div>
          {weekDates.map((date, index) => {
            const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={index} 
                className={`p-4 text-center font-medium border-r border-slate-200 ${
                  isToday ? 'text-blue-700 bg-blue-50' : 'text-slate-700'
                }`}
              >
                {dayNames[index]}
                <br />
                <span className={`text-xs ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {isToday && ' (Today)'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time slots with appointments */}
        {timeSlots.map((timeSlot, timeIndex) => (
          <div key={timeIndex} className="grid grid-cols-8 border-b border-slate-100 min-h-[80px]">
            <div className="p-4 text-center text-sm text-slate-600 border-r border-slate-200 bg-slate-50">
              {timeSlot}
            </div>
            {weekDates.map((date, dateIndex) => {
              const dayJobs = getJobsForDateTime(date, timeSlot);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={dateIndex} 
                  className={`p-2 border-r border-slate-200 relative ${
                    isToday ? 'bg-blue-25' : ''
                  }`}
                >
                  {dayJobs.map((job) => (
                    <div 
                      key={job.id} 
                      className={`p-2 rounded text-xs border-l-4 ${getStatusColor(job.status)}`}
                      data-testid={`appointment-${job.id}`}
                    >
                      <div className="font-medium">{job.title}</div>
                      <div className="truncate">{getClientName(job.clientId)}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}

        {jobs?.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <p>No appointments scheduled</p>
            <p className="text-sm">Click "New Appointment" to schedule your first job</p>
          </div>
        )}
      </Card>
    </div>
  );
}
