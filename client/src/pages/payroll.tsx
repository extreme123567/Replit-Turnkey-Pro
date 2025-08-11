import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, DollarSign, Users, Calculator } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Staff, TimeEntry } from "@shared/schema";

export default function Payroll() {
  const [payPeriod, setPayPeriod] = useState("current");
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay() + 7);
    return sunday.toISOString().split('T')[0];
  });

  const { data: staff, isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const { data: timeEntries, isLoading: timeEntriesLoading } = useQuery<TimeEntry[]>({
    queryKey: ["/api/time-entries"],
  });

  const isLoading = staffLoading || timeEntriesLoading;

  const calculatePayrollStats = () => {
    if (!staff || !timeEntries) return { totalHours: 0, totalPayroll: 0, activeStaff: 0 };

    const periodStart = new Date(startDate);
    const periodEnd = new Date(endDate);
    
    const periodEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= periodStart && entryDate <= periodEnd;
    });

    const totalHours = periodEntries.reduce((sum, entry) => sum + parseFloat(entry.hours || "0"), 0);
    
    const totalPayroll = staff.reduce((sum, member) => {
      const memberEntries = periodEntries.filter(entry => entry.staffId === member.id);
      const memberHours = memberEntries.reduce((hrs, entry) => hrs + parseFloat(entry.hours || "0"), 0);
      const regularHours = Math.min(memberHours, 40);
      const overtimeHours = Math.max(memberHours - 40, 0);
      const regularPay = regularHours * parseFloat(member.hourlyRate);
      const overtimePay = overtimeHours * parseFloat(member.hourlyRate) * 1.5;
      return sum + regularPay + overtimePay;
    }, 0);

    const activeStaff = staff.filter(member => member.status !== 'inactive').length;

    return { totalHours, totalPayroll, activeStaff };
  };

  const calculateStaffPay = (staffMember: Staff) => {
    if (!timeEntries) return { regularHours: 0, overtimeHours: 0, regularPay: 0, overtimePay: 0, totalPay: 0 };

    const periodStart = new Date(startDate);
    const periodEnd = new Date(endDate);
    
    const memberEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entry.staffId === staffMember.id && entryDate >= periodStart && entryDate <= periodEnd;
    });

    const totalHours = memberEntries.reduce((hrs, entry) => hrs + parseFloat(entry.hours || "0"), 0);
    const regularHours = Math.min(totalHours, 40);
    const overtimeHours = Math.max(totalHours - 40, 0);
    const hourlyRate = parseFloat(staffMember.hourlyRate);
    const regularPay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * hourlyRate * 1.5;
    const totalPay = regularPay + overtimePay;

    return { regularHours, overtimeHours, regularPay, overtimePay, totalPay, totalHours };
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'lead_technician': return 'Lead Technician';
      case 'technician': return 'Technician';
      case 'apprentice': return 'Apprentice';
      default: return role;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

  const getApprovalStatus = (staffMember: Staff) => {
    // For demo purposes, alternate approval status
    const approved = staffMember.name.length % 2 === 0;
    return approved ? 'approved' : 'pending';
  };

  const stats = calculatePayrollStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Payroll Management</h3>
          <p className="text-slate-600">Track hours and calculate payments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={payPeriod} onValueChange={setPayPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Pay Period</SelectItem>
              <SelectItem value="previous">Previous Period</SelectItem>
              <SelectItem value="custom">Custom Period</SelectItem>
            </SelectContent>
          </Select>
          <Button className="servicepro-btn-primary" data-testid="button-process-payroll">
            <Calculator className="mr-2 h-4 w-4" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Hours</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-total-hours">
                  {stats.totalHours.toFixed(1)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="text-blue-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">This pay period</p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Payroll</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-total-payroll">
                  ${stats.totalPayroll.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-emerald-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Before taxes & deductions</p>
          </CardContent>
        </Card>

        <Card className="servicepro-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Active Staff</p>
                <p className="text-2xl font-bold text-slate-800 mt-1" data-testid="stat-active-staff">
                  {stats.activeStaff}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="text-purple-600" size={20} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">Employees this period</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card className="servicepro-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-slate-800">Staff Hours & Pay</h4>
            <div className="flex items-center space-x-3">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
                data-testid="input-start-date"
              />
              <span className="text-slate-600">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
                data-testid="input-end-date"
              />
            </div>
          </div>

          {!staff || staff.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <p>No staff members found</p>
              <p className="text-sm">Add staff members to track payroll</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Hours Worked</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead>Regular Pay</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Total Pay</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => {
                    const payData = calculateStaffPay(member);
                    const approvalStatus = getApprovalStatus(member);
                    
                    return (
                      <TableRow key={member.id} data-testid={`payroll-row-${member.id}`}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getInitialsColor(member.name)}`}>
                              <span className="font-medium text-sm">{getInitials(member.name)}</span>
                            </div>
                            <div>
                              <div className="font-medium text-slate-800">{member.name}</div>
                              <div className="text-sm text-slate-600">ID: {member.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-800">{getRoleDisplay(member.role)}</TableCell>
                        <TableCell className="text-slate-800 font-medium">{payData.totalHours.toFixed(1)}</TableCell>
                        <TableCell className="text-slate-800">${member.hourlyRate}</TableCell>
                        <TableCell className="text-slate-800">${payData.regularPay.toFixed(2)}</TableCell>
                        <TableCell className="text-slate-800">${payData.overtimePay.toFixed(2)}</TableCell>
                        <TableCell className="text-slate-800 font-bold">${payData.totalPay.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge 
                            className={approvalStatus === 'approved' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                            }
                          >
                            {approvalStatus === 'approved' ? 'Approved' : 'Pending'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {staff && staff.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200 bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Pay Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Total Gross Pay</p>
                  <p className="text-xl font-bold text-slate-800" data-testid="total-gross-pay">
                    ${stats.totalPayroll.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
