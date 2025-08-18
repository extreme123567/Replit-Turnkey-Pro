import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell, Plus, User, X, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

// Sample notifications data - in a real app this would come from an API
const sampleNotifications = [
  {
    id: 1,
    type: "urgent",
    title: "Job Approval Required",
    message: "Paint job at Sunset Gardens Unit 4B needs approval",
    timestamp: "2 minutes ago",
    isRead: false
  },
  {
    id: 2,
    type: "info",
    title: "Job Completed",
    message: "Cleaning at Oak Ridge Unit 12A has been completed",
    timestamp: "15 minutes ago",
    isRead: false
  },
  {
    id: 3,
    type: "warning",
    title: "Callback Scheduled",
    message: "Touch-up required at Sunset Gardens Unit 2A",
    timestamp: "1 hour ago",
    isRead: true
  },
  {
    id: 4,
    type: "success",
    title: "Payment Processed",
    message: "Technician payout for this week has been processed",
    timestamp: "2 hours ago",
    isRead: true
  }
];

function getNotificationIcon(type: string) {
  switch (type) {
    case "urgent":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <Clock className="h-4 w-4 text-orange-500" />;
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4 text-blue-500" />;
  }
}

function getNotificationBadgeColor(type: string) {
  switch (type) {
    case "urgent":
      return "bg-red-100 text-red-800 border-red-200";
    case "warning":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "success":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
}

export function Header() {
  const [location] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const pageInfo = pageTitles[location as keyof typeof pageTitles] || { title: "Turnkey Pro", subtitle: "" };
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: number) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{pageInfo.title}</h2>
          <p className="text-slate-600">{pageInfo.subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationRef}>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                <Card className="border-0 shadow-none">
                  <CardHeader className="border-b border-slate-100 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Notifications</CardTitle>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-700"
                            data-testid="button-mark-all-read"
                          >
                            Mark all read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowNotifications(false)}
                          className="h-6 w-6"
                          data-testid="button-close-notifications"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <Bell className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-slate-500">No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                              !notification.isRead ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                            data-testid={`notification-${notification.id}`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${
                                      !notification.isRead ? 'text-slate-900' : 'text-slate-700'
                                    }`}>
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-slate-600 mt-1">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="text-xs text-slate-500">
                                        {notification.timestamp}
                                      </p>
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${getNotificationBadgeColor(notification.type)}`}
                                      >
                                        {notification.type}
                                      </Badge>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 ml-2 opacity-0 group-hover:opacity-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    data-testid={`button-delete-notification-${notification.id}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full absolute right-4 top-6"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
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
