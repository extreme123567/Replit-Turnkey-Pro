import { Link, useLocation } from "wouter";
import { 
  Calendar, 
  Users, 
  UserCheck, 
  MessageSquare, 
  DollarSign, 
  FileText,
  Wrench,
  Building,
  ClipboardList,
  HardHat,
  Search,
  Shield,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, logout } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const dashboards = [
  { name: "Admin Dashboard", href: "/admin", icon: Shield },
  { name: "Property Manager", href: "/property-manager", icon: Building },
  { name: "Office Staff", href: "/office-staff", icon: ClipboardList },
  { name: "Technician", href: "/technician", icon: HardHat },
  { name: "Inspector", href: "/inspector", icon: Search },
];

const navigation = [
  { name: "Scheduling", href: "/scheduling", icon: Calendar },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Messages", href: "/messaging", icon: MessageSquare, badge: 3 },
  { name: "Finance", href: "/finance", icon: DollarSign },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-slate-200 flex-shrink-0">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Wrench className="text-white text-sm" size={16} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Turnkey Pro</h1>
        </div>
      </div>
      
      <nav className="px-4 py-6 space-y-6">
        {/* Dashboard Section */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
            Dashboards
          </h3>
          <div className="space-y-1">
            {dashboards.map((item) => {
              const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer",
                      isActive
                        ? "servicepro-nav-active"
                        : "servicepro-nav-item"
                    )}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* General Navigation */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
            Management
          </h3>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer",
                      isActive
                        ? "servicepro-nav-active"
                        : "servicepro-nav-item"
                    )}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full ml-auto">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      
      {/* User Profile and Logout */}
      <div className="p-4 border-t border-slate-200 mt-auto">
        {user && (
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-500 truncate capitalize">
                {user.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-600 hover:text-slate-800 hover:bg-slate-100"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
