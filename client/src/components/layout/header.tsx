import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell, Plus, User } from "lucide-react";

const pageTitles = {
  "/": { title: "Dashboard", subtitle: "Overview of your business performance" },
  "/dashboard": { title: "Dashboard", subtitle: "Overview of your business performance" },
  "/scheduling": { title: "Scheduling", subtitle: "Manage your service appointments" },
  "/clients": { title: "Client Management", subtitle: "Manage your client relationships" },
  "/staff": { title: "Staff Management", subtitle: "Manage your team and assignments" },
  "/messaging": { title: "Messages", subtitle: "Communicate with clients and team" },
  "/payroll": { title: "Payroll Management", subtitle: "Track hours and calculate payments" },
  "/invoices": { title: "Invoice Management", subtitle: "Create and manage invoices" },
};

export function Header() {
  const [location] = useLocation();
  const pageInfo = pageTitles[location as keyof typeof pageTitles] || { title: "Turnkey Pro", subtitle: "" };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{pageInfo.title}</h2>
          <p className="text-slate-600">{pageInfo.subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                2
              </span>
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-700">John Smith</span>
            <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
              <User className="text-slate-600 text-sm" size={16} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
