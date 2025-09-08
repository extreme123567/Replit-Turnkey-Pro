import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md w-full">
        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-bold text-slate-800 tracking-tight">
            Turnkey Pro
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
          <p className="text-slate-600 text-lg">Property Management Platform</p>
        </div>
        
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800">Access Management Portal</h2>
              <p className="text-slate-600 text-sm">
                Sign in to manage properties, track apartment turnovers, and oversee operations.
              </p>
              <Button 
                onClick={() => setLocation("/login")}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}