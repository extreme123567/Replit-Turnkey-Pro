import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Calendar, Briefcase } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StaffForm } from "@/components/forms/staff-form";
import { queryClient } from "@/lib/queryClient";
import type { Staff } from "@shared/schema";

export default function Staff() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: staff, isLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getInitialsColor = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-emerald-100 text-emerald-700',
      'bg-purple-100 text-purple-700',
      'bg-amber-100 text-amber-700',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-emerald-100 text-emerald-800">Available</Badge>;
      case 'on_job':
        return <Badge className="bg-amber-100 text-amber-800">On Job</Badge>;
      case 'sick_leave':
        return <Badge className="bg-red-100 text-red-800">Sick Leave</Badge>;
      case 'vacation':
        return <Badge className="bg-blue-100 text-blue-800">Vacation</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">{status}</Badge>;
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'lead_technician':
        return 'Lead Technician';
      case 'technician':
        return 'Technician';
      case 'apprentice':
        return 'Apprentice';
      default:
        return role;
    }
  };

  // Get current week dates for schedule
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
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Staff Management</h3>
          <p className="text-slate-600">Manage your team and assignments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="servicepro-btn-primary" data-testid="button-add-staff">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <StaffForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {staff?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            <UserPlus className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p>No staff members yet</p>
            <p className="text-sm">Add your first team member to get started</p>
          </div>
        ) : (
          staff?.map((member) => (
            <Card key={member.id} className="servicepro-card p-6" data-testid={`card-staff-${member.id}`}>
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getInitialsColor(member.firstName + ' ' + member.lastName)}`}>
                  <span className="font-bold">{getInitials(member.firstName, member.lastName)}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{member.firstName} {member.lastName}</h4>
                  <p className="text-sm text-slate-600">{getRoleDisplay(member.role)}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Hours this week:</span>
                  <span className="font-medium text-slate-800">{member.hoursThisWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Active jobs:</span>
                  <span className="font-medium text-slate-800">{member.activeJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Hourly rate:</span>
                  <span className="font-medium text-slate-800">${member.hourlyRate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Status:</span>
                  {getStatusBadge(member.status)}
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  data-testid={`button-schedule-${member.id}`}
                >
                  <Calendar className="mr-1 h-3 w-3" />
                  Schedule
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  disabled={member.status === 'sick_leave' || member.status === 'vacation'}
                  data-testid={`button-assign-${member.id}`}
                >
                  <Briefcase className="mr-1 h-3 w-3" />
                  Assign Job
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Weekly Schedule Table */}
      {staff && staff.length > 0 && (
        <Card className="servicepro-card">
          <CardContent className="p-6">
            <h4 className="text-lg font-bold text-slate-800 mb-6">Weekly Schedule</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    {dayNames.map((day, index) => (
                      <TableHead key={day} className="text-center">
                        {day}
                        <br />
                        <span className="text-xs text-slate-500">
                          {weekDates[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id} data-testid={`schedule-row-${member.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getInitialsColor(member.firstName + ' ' + member.lastName)}`}>
                            <span className="font-medium text-xs">{getInitials(member.firstName, member.lastName)}</span>
                          </div>
                          <span className="font-medium text-slate-800">{member.firstName} {member.lastName}</span>
                        </div>
                      </TableCell>
                      {dayNames.map((day, dayIndex) => {
                        const isWeekend = dayIndex >= 5;
                        const isOnLeave = member.status === 'sick_leave' || member.status === 'vacation';
                        
                        return (
                          <TableCell key={day} className="text-center">
                            {isWeekend ? (
                              <span className="text-slate-400 text-xs">Off</span>
                            ) : isOnLeave ? (
                              <span className="text-red-500 text-xs">{member.status === 'sick_leave' ? 'Sick' : 'Vacation'}</span>
                            ) : (
                              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                8:00-17:00
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
