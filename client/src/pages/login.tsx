import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wrench, Loader2, Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface LoginResponse {
  message: string;
  user: {
    id: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
  };
  token: string;
}

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneNumber: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest): Promise<LoginResponse> => {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Store the token in localStorage
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("current_user", JSON.stringify(data.user));
      
      // Redirect based on user role
      const roleRoutes: Record<string, string> = {
        admin: "/admin",
        office_staff: "/office-staff",
        property_manager: "/property-manager",
        technician: "/technician",
        inspector: "/inspector",
      };

      const redirectPath = roleRoutes[data.user.role] || "/";
      setLocation(redirectPath);
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
      setError(error.message || "Login failed. Please check your credentials.");
    },
  });

  const onSubmit = (data: LoginRequest) => {
    setError("");
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Wrench className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">ServicePro</h1>
          </div>
          <CardTitle className="text-xl">Sign in to your account</CardTitle>
          <CardDescription>
            Enter your phone number and password to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="(252) 555-1001"
                        data-testid="input-phone"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          data-testid="input-password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <p>Need access? Contact your system administrator.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}