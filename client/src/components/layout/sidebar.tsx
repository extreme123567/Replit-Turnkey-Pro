import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserCheck, 
  MessageSquare, 
  DollarSign, 
  FileText,
  Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Scheduling", href: "/scheduling", icon: Calendar },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Staff", href: "/staff", icon: UserCheck },
  { name: "Messages", href: "/messaging", icon: MessageSquare, badge: 3 },
  { name: "Payroll", href: "/payroll", icon: DollarSign },
  { name: "Invoices", href: "/invoices", icon: FileText },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-slate-200 flex-shrink-0">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Wrench className="text-white text-sm" size={16} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">ServicePro</h1>
        </div>
      </div>
      
      <nav className="px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
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
              </a>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
