import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/app-layout";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
// Removed general dashboard - users go directly to role-specific dashboards
import PropertyManagerDashboard from "@/pages/property-manager-dashboard";
import OfficeStaffDashboard from "@/pages/office-staff-dashboard";
import AdminDashboard from "@/pages/admin-dashboard-responsive";
import TechnicianDashboard from "@/pages/technician-dashboard";
import InspectorDashboard from "@/pages/inspector-dashboard";
import Scheduling from "@/pages/scheduling";
import Clients from "@/pages/clients";
import Staff from "@/pages/staff";
import Messaging from "@/pages/messaging";
import Payroll from "@/pages/payroll";
import Invoices from "@/pages/invoices";
import EnhancedStaffDashboard from "@/pages/enhanced-staff-dashboard";

// Protected route wrapper
function ProtectedRoute({ component: Component, allowedRoles }: { 
  component: React.ComponentType; 
  allowedRoles?: string[];
}) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
          <p className="text-slate-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Show login page if not authenticated and not already on login page
  if (!isAuthenticated && !isLoading && location !== "/login") {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Role-specific dashboards */}
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/property-manager">
        <ProtectedRoute component={PropertyManagerDashboard} allowedRoles={["admin", "office_staff", "property_manager"]} />
      </Route>
      
      <Route path="/office-staff">
        <ProtectedRoute component={OfficeStaffDashboard} allowedRoles={["admin", "office_staff"]} />
      </Route>
      
      <Route path="/technician">
        <ProtectedRoute component={TechnicianDashboard} allowedRoles={["admin", "office_staff", "technician"]} />
      </Route>
      
      <Route path="/inspector">
        <ProtectedRoute component={InspectorDashboard} allowedRoles={["admin", "office_staff", "inspector"]} />
      </Route>

      {/* General pages */}
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      
      <Route path="/dashboard" component={Dashboard} />
      
      <Route path="/scheduling">
        <ProtectedRoute component={Scheduling} />
      </Route>
      
      <Route path="/clients">
        <ProtectedRoute component={Clients} />
      </Route>
      
      <Route path="/staff">
        <ProtectedRoute component={Staff} allowedRoles={["admin", "office_staff"]} />
      </Route>
      
      <Route path="/staff/enhanced">
        <ProtectedRoute component={EnhancedStaffDashboard} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/messaging">
        <ProtectedRoute component={Messaging} />
      </Route>
      
      <Route path="/payroll">
        <ProtectedRoute component={Payroll} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/invoices">
        <ProtectedRoute component={Invoices} allowedRoles={["admin", "office_staff"]} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen bg-slate-50">
          <Switch>
            <Route path="/login" component={Login} />
            <Route>
              <AppLayout>
                <Router />
              </AppLayout>
            </Route>
          </Switch>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
