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
      case 'in_progress': return 'bg-gradient-to-br from-amber-100 to-orange-100 border-l-amber-500 text-amber-900 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200';
      case 'scheduled': return 'bg-gradient-to-br from-blue-100 to-indigo-100 border-l-blue-500 text-blue-900 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200';
      case 'completed': return 'bg-gradient-to-br from-emerald-100 to-green-100 border-l-emerald-500 text-emerald-900 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200';
      default: return 'bg-gradient-to-br from-slate-100 to-gray-100 border-l-slate-500 text-slate-900 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200';
    }
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    const timeSlots = ["9:00 AM", "1:00 PM", "3:00 PM"];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="space-y-0">
        {/* Header */}
        <div className="grid grid-cols-8 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
          <div className="p-4 text-center font-semibold text-slate-700 border-r border-slate-200/60 bg-gradient-to-b from-slate-100 to-slate-50">
            Time
          </div>
          {weekDates.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <div 
                key={index} 
                className={`p-4 text-center font-semibold border-r border-slate-200/60 transition-all duration-300 ${
                  isToday 
                    ? 'text-blue-700 bg-gradient-to-b from-blue-50 to-indigo-50 shadow-sm' 
                    : 'text-slate-700 hover:bg-gradient-to-b hover:from-slate-50 hover:to-slate-100'
                }`}
              >
                {dayNames[index]}
                <br />
                <span className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                  {formatDate(date, 'MMM d')}
                  {isToday && (
                    <span className="block text-xs font-bold text-blue-500 animate-pulse">Today</span>
                  )}
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
                      className={`p-2 rounded-lg text-xs border-l-4 mb-1 cursor-pointer transform ${getStatusColor(job.status)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onJobClick?.(job);
                      }}
                      data-testid={`job-${job.id}`}
                    >
                      <div className="font-semibold truncate">{job.title}</div>
                      <div className="truncate text-xs opacity-80">{getClientName(job.clientId)}</div>
                    </div>
                  ))}
                  {dayJobs.length === 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-full opacity-0 hover:opacity-100 transition-all duration-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:scale-105 group"
                      onClick={() => onCreateJob?.(date, timeSlot)}
                    >
                      <Plus className="h-4 w-4 text-blue-500 group-hover:rotate-90 transition-transform duration-200" />
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
        <div className="grid grid-cols-7 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
          {dayNames.map((day) => (
            <div key={day} className="p-4 text-center font-semibold text-slate-700 border-r border-slate-200/60 last:border-r-0 bg-gradient-to-b from-slate-100 to-slate-50">
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
                className={`min-h-[130px] p-3 border-r border-b border-slate-200/60 last:border-r-0 cursor-pointer hover:bg-slate-50/50 transition-all duration-200 group ${
                  !isCurrentMonth ? 'bg-slate-50/80 text-slate-400' : 'hover:shadow-sm'
                } ${isToday ? 'bg-gradient-to-br from-blue-50 to-indigo-50 ring-1 ring-blue-200' : ''}`}
                onClick={() => onCreateJob?.(date)}
              >
                <div className={`text-sm font-bold mb-3 flex items-center justify-between ${
                  isToday ? 'text-blue-700' : isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  <span>{date.getDate()}</span>
                  {isToday && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayJobs.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      className={`text-xs p-2 rounded-lg truncate cursor-pointer border-l-3 transform ${getStatusColor(job.status)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onJobClick?.(job);
                      }}
                      data-testid={`job-${job.id}`}
                    >
                      <div className="font-semibold">{job.title}</div>
                    </div>
                  ))}
                  {dayJobs.length > 3 && (
                    <div className="text-xs text-slate-500 text-center font-medium bg-slate-100 rounded-md py-1 transition-colors duration-200 hover:bg-slate-200">
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
        <div className="p-6 border-b border-slate-200/60 text-center font-bold text-lg bg-gradient-to-r from-slate-50 to-white text-slate-800">
          {formatDate(currentDate, 'EEEE, MMMM d, yyyy')}
        </div>
        {timeSlots.map((timeSlot, index) => {
          const dayJobs = getJobsForDateTime(currentDate, timeSlot);
          const isCurrentHour = new Date().getHours() === (index + 8);
          
          return (
            <div key={index} className={`flex border-b border-slate-100/60 min-h-[70px] ${
              isCurrentHour ? 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50' : ''
            }`}>
              <div className={`w-24 p-4 text-sm font-semibold border-r border-slate-200/60 bg-gradient-to-b from-slate-100 to-slate-50 flex items-center justify-center ${
                isCurrentHour ? 'text-blue-700 bg-gradient-to-b from-blue-100 to-indigo-100' : 'text-slate-600'
              }`}>
                {timeSlot}
                {isCurrentHour && (
                  <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                )}
              </div>
              <div className="flex-1 p-3 cursor-pointer hover:bg-slate-50/50 transition-colors duration-200" onClick={() => onCreateJob?.(currentDate, timeSlot)}>
                {dayJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`p-3 rounded-lg text-sm border-l-4 mb-2 cursor-pointer transform ${getStatusColor(job.status)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onJobClick?.(job);
                    }}
                    data-testid={`job-${job.id}`}
                  >
                    <div className="font-bold">{job.title}</div>
                    <div className="text-xs opacity-80 mt-1">{getClientName(job.clientId)}</div>
                  </div>
                ))}
                {dayJobs.length === 0 && (
                  <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <Plus className="h-5 w-5 text-blue-400 hover:text-blue-600 hover:scale-110 transition-all duration-200" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="servicepro-card shadow-lg border-0 bg-gradient-to-br from-white to-slate-50/30 overflow-hidden">
      <CardContent className="p-0">
        {/* Calendar controls */}
        <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDateNavigation("prev")}
                data-testid="button-prev-period"
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:scale-105 transition-all duration-200 shadow-sm group"
              >
                <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDateNavigation("next")}
                data-testid="button-next-period"
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:scale-105 transition-all duration-200 shadow-sm group"
              >
                <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              {viewMode === "week" 
                ? `Week of ${formatDate(getWeekDates(currentDate)[0], 'MMM d, yyyy')}`
                : viewMode === "month" 
                  ? formatDate(currentDate, 'MMMM yyyy')
                  : formatDate(currentDate, 'MMMM d, yyyy')
              }
            </h3>
          </div>
          <Select value={viewMode} onValueChange={onViewModeChange}>
            <SelectTrigger className="w-36 bg-white border-slate-200 hover:border-blue-300 transition-colors duration-200 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 shadow-xl">
              <SelectItem value="day" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors duration-150">Day</SelectItem>
              <SelectItem value="week" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors duration-150">Week</SelectItem>
              <SelectItem value="month" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors duration-150">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Calendar content */}
        <div className="overflow-x-auto bg-white">
          {viewMode === "week" && renderWeekView()}
          {viewMode === "month" && renderMonthView()}
          {viewMode === "day" && renderDayView()}
        </div>
      </CardContent>
    </Card>
  );
}
