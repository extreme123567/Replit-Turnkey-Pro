import { Link, useLocation } from "wouter";
import { Shield, Building, Users, Wrench, Eye, Calendar, MessageSquare, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function MobileNavbar() {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const getNavItems = () => {
    const role = user.role;
    
    switch (role) {
      case 'admin':
        return [
          { icon: Shield, label: 'Admin', href: '/admin', key: 'admin' },
          { icon: Calendar, label: 'Schedule', href: '/scheduling', key: 'scheduling' },
          { icon: Users, label: 'Staff', href: '/staff', key: 'staff' },
          { icon: MessageSquare, label: 'Messages', href: '/messaging', key: 'messaging' }
        ];
      case 'office_staff':
        return [
          { icon: Home, label: 'Dashboard', href: '/office-staff', key: 'office-staff' },
          { icon: Calendar, label: 'Schedule', href: '/scheduling', key: 'scheduling' },
          { icon: Users, label: 'Staff', href: '/staff', key: 'staff' },
          { icon: Building, label: 'Properties', href: '/clients', key: 'clients' }
        ];
      case 'property_manager':
        return [
          { icon: Building, label: 'Properties', href: '/property-manager', key: 'property-manager' },
          { icon: Calendar, label: 'Jobs', href: '/scheduling', key: 'scheduling' },
          { icon: MessageSquare, label: 'Messages', href: '/messaging', key: 'messaging' },
          { icon: Eye, label: 'Reports', href: '/reports', key: 'reports' }
        ];
      case 'technician':
        return [
          { icon: Wrench, label: 'Jobs', href: '/technician', key: 'technician' },
          { icon: Calendar, label: 'Schedule', href: '/scheduling', key: 'scheduling' },
          { icon: MessageSquare, label: 'Messages', href: '/messaging', key: 'messaging' },
          { icon: Eye, label: 'Profile', href: '/profile', key: 'profile' }
        ];
      case 'inspector':
        return [
          { icon: Eye, label: 'Inspections', href: '/inspector', key: 'inspector' },
          { icon: Calendar, label: 'Schedule', href: '/scheduling', key: 'scheduling' },
          { icon: MessageSquare, label: 'Messages', href: '/messaging', key: 'messaging' },
          { icon: Building, label: 'Properties', href: '/properties', key: 'properties' }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-1 safe-area-pb">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ icon: Icon, label, href, key }) => {
          const isActive = location.startsWith(href);
          
          return (
            <Link key={key} href={href}>
              <button
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1",
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                )}
                data-testid={`nav-${key}`}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs font-medium truncate">{label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}