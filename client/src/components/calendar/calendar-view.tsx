import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { formatDate, getWeekDates, getMonthDates } from "@/lib/date-utils";
import type { Job, Client, Staff } from "@shared/schema";

interface CalendarViewProps {
  jobs: Job[];
  clients: Client[];
  staff: Staff[];
  viewMode: "week" | "month" | "day";
  onViewModeChange: (mode: "week" | "month" | "day") => void;
  onDateChange: (date: Date) => void;
  onJobClick?: (job: Job) => void;
  onCreateJob?: (date: Date, timeSlot?: string) => void;
}

export function CalendarView({
  jobs,
  clients,
  staff,
  viewMode,
  onViewModeChange,
  onDateChange,
  onJobClick,
  onCreateJob,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleDateNavigation = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    } else if (viewMode === "month") {
      newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
    onDateChange(newDate);
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  const getJobsForDateTime = (date: Date, timeSlot?: string) => {
    return jobs.filter(job => {
      const jobDate = new Date(job.scheduledDate);
      const isSameDay = jobDate.toDateString() === date.toDateString();
      
      if (!timeSlot) return isSameDay;
      
      // Simple time matching for time slots
      const jobHour = jobDate.getHours();
      const slotHour = timeSlot.includes('9:00') ? 9 : 
                     timeSlot.includes('1:00') ? 13 : 
                     timeSlot.includes('3:00') ? 15 : 9;
      
      return isSameDay && Math.abs(jobHour - slotHour) < 2;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-amber-100 border-amber-500 text-amber-900';
      case 'scheduled': return 'bg-blue-100 border-blue-500 text-blue-900';
      case 'completed': return 'bg-emerald-100 border-emerald-500 text-emerald-900';
      default: return 'bg-slate-100 border-slate-500 text-slate-900';
    }
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    const timeSlots = ["9:00 AM", "1:00 PM", "3:00 PM"];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="space-y-0">
        {/* Header */}
        <div className="grid grid-cols-8 border-b border-slate-200">
          <div className="p-4 text-center font-medium text-slate-600 border-r border-slate-200">
            Time
          </div>
          {weekDates.map((date, index) => {
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
                  {formatDate(date, 'MMM d')}
                  {isToday && ' (Today)'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time slots */}
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
                  onClick={() => onCreateJob?.(date, timeSlot)}
                >
                  {dayJobs.map((job) => (
                    <div 
                      key={job.id} 
                      className={`p-2 rounded text-xs border-l-4 mb-1 cursor-pointer ${getStatusColor(job.status)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onJobClick?.(job);
                      }}
                      data-testid={`job-${job.id}`}
                    >
                      <div className="font-medium truncate">{job.title}</div>
                      <div className="truncate">{getClientName(job.clientId)}</div>
                    </div>
                  ))}
                  {dayJobs.length === 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-full opacity-0 hover:opacity-100 transition-opacity"
                      onClick={() => onCreateJob?.(date, timeSlot)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDates = getMonthDates(currentDate);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="space-y-0">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {dayNames.map((day) => (
            <div key={day} className="p-4 text-center font-medium text-slate-600 border-r border-slate-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {monthDates.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const dayJobs = getJobsForDateTime(date);

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-slate-200 last:border-r-0 ${
                  !isCurrentMonth ? 'bg-slate-50 text-slate-400' : ''
                } ${isToday ? 'bg-blue-50' : ''}`}
                onClick={() => onCreateJob?.(date)}
              >
                <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-700' : ''}`}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayJobs.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      className={`text-xs p-1 rounded truncate cursor-pointer ${getStatusColor(job.status)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onJobClick?.(job);
                      }}
                      data-testid={`job-${job.id}`}
                    >
                      {job.title}
                    </div>
                  ))}
                  {dayJobs.length > 3 && (
                    <div className="text-xs text-slate-500 text-center">
                      +{dayJobs.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const timeSlots = Array.from({ length: 12 }, (_, i) => {
      const hour = i + 8; // Start from 8 AM
      return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
    });

    return (
      <div className="space-y-0">
        <div className="p-4 border-b border-slate-200 text-center font-medium">
          {formatDate(currentDate, 'EEEE, MMMM d, yyyy')}
        </div>
        {timeSlots.map((timeSlot, index) => {
          const dayJobs = getJobsForDateTime(currentDate, timeSlot);
          
          return (
            <div key={index} className="flex border-b border-slate-100 min-h-[60px]">
              <div className="w-20 p-4 text-sm text-slate-600 border-r border-slate-200 bg-slate-50">
                {timeSlot}
              </div>
              <div className="flex-1 p-2" onClick={() => onCreateJob?.(currentDate, timeSlot)}>
                {dayJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`p-2 rounded text-sm border-l-4 mb-1 cursor-pointer ${getStatusColor(job.status)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onJobClick?.(job);
                    }}
                    data-testid={`job-${job.id}`}
                  >
                    <div className="font-medium">{job.title}</div>
                    <div className="text-xs">{getClientName(job.clientId)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="servicepro-card">
      <CardContent className="p-0">
        {/* Calendar controls */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDateNavigation("prev")}
                data-testid="button-prev-period"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDateNavigation("next")}
                data-testid="button-next-period"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h3 className="text-lg font-semibold">
              {viewMode === "week" 
                ? `Week of ${formatDate(getWeekDates(currentDate)[0], 'MMM d, yyyy')}`
                : viewMode === "month" 
                  ? formatDate(currentDate, 'MMMM yyyy')
                  : formatDate(currentDate, 'MMMM d, yyyy')
              }
            </h3>
          </div>
          <Select value={viewMode} onValueChange={onViewModeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Calendar content */}
        <div className="overflow-x-auto">
          {viewMode === "week" && renderWeekView()}
          {viewMode === "month" && renderMonthView()}
          {viewMode === "day" && renderDayView()}
        </div>
      </CardContent>
    </Card>
  );
}
