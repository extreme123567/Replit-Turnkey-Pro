import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [token, setToken] = useState<string | null>(() => 
    localStorage.getItem("auth_token")
  );

  // Query to get current user if token exists
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Check if user data exists in localStorage as fallback
  const [cachedUser, setCachedUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("current_user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("auth_token"));
      const stored = localStorage.getItem("current_user");
      setCachedUser(stored ? JSON.parse(stored) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const currentUser = user || cachedUser;
  const isAuthenticated = !!token && !!currentUser;

  return {
    user: currentUser,
    token,
    isAuthenticated,
    isLoading: isLoading && !!token,
  };
}

export function logout() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("current_user");
  window.location.href = "/login";
}

// Utility to get token for API requests
export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

// Setup API request interceptor to include auth token
export function setupAuthInterceptor() {
  // This will be used in queryClient.ts to automatically add auth headers
  return {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  };
}