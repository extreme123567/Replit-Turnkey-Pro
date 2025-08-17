import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield,
  Users, 
  Building,
  Wrench,
  Search,
  ArrowRight
} from "lucide-react";

// Role-based dashboard routing component
export default function Dashboard() {
  const [, setLocation] = useLocation();

  // For now, show role selection since we don't have user authentication yet
  // Later this will automatically redirect based on logged-in user's role

  const dashboardOptions = [
    {
      title: "Admin Dashboard",
      description: "Complete business oversight with financial controls",
      icon: Shield,
      path: "/admin",
      color: "bg-red-50 border-red-200 hover:bg-red-100",
      iconColor: "text-red-600",
      features: ["Financial Analytics", "Staff Management", "Revenue Tracking", "System Settings"]
    },
    {
      title: "Office Staff Dashboard", 
      description: "Operations management and job assignments",
      icon: Users,
      path: "/office-staff",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100", 
      iconColor: "text-blue-600",
      features: ["Job Assignments", "Property Management", "Staff Coordination", "Operations"]
    },
    {
      title: "Property Manager Dashboard",
      description: "Property oversight and request management", 
      icon: Building,
      path: "/property-manager",
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      iconColor: "text-green-600", 
      features: ["Property Overview", "Approval Requests", "Progress Tracking", "Communication"]
    },
    {
      title: "Technician Dashboard",
      description: "Work order execution and time tracking",
      icon: Wrench,
      path: "/technician", 
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
      iconColor: "text-orange-600",
      features: ["Daily Schedule", "Work Orders", "Time Tracking", "Job Updates"]
    },
    {
      title: "Inspector Dashboard",
      description: "Quality inspections and compliance tracking",
      icon: Search,
      path: "/inspector",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100", 
      iconColor: "text-purple-600",
      features: ["Inspections", "Quality Control", "Compliance", "Reports"]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="title-dashboard-select">
          ServicePro - QC Apartment Turns
        </h1>
        <p className="text-lg text-gray-600" data-testid="text-dashboard-description">
          Select your role to access your personalized dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card 
              key={option.path} 
              className={`${option.color} border-2 transition-all duration-200 cursor-pointer transform hover:scale-105`}
              onClick={() => setLocation(option.path)}
              data-testid={`card-dashboard-${option.path.replace('/', '')}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`p-3 rounded-full bg-white shadow-sm`}>
                    <Icon className={option.iconColor} size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900" data-testid={`text-title-${option.path.replace('/', '')}`}>
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600" data-testid={`text-description-${option.path.replace('/', '')}`}>
                      {option.description}
                    </p>
                  </div>
                  <ArrowRight className="text-gray-400" size={20} />
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Key Features
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {option.features.map((feature, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs bg-white bg-opacity-60 text-gray-700 rounded-full"
                        data-testid={`badge-feature-${feature.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-2" data-testid="text-system-status">
              System Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-gray-600">Properties</p>
                <p className="font-semibold text-green-600" data-testid="text-property-count">1 Active</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-600">Staff Members</p>
                <p className="font-semibold text-blue-600" data-testid="text-staff-count">2 Active</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-600">System</p>
                <p className="font-semibold text-green-600" data-testid="text-system-ready">Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}