import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
    "Content-Type": "application/json",
  };
}

export async function apiRequest(
  url: string,
  method: string = "GET",
  body?: any,
): Promise<any> {
  // Ensure method is a string
  const httpMethod = typeof method === 'string' ? method : 'GET';
  console.log('API Request:', { url, method: httpMethod, body });
  
  const options: RequestInit = {
    method: httpMethod,
    headers: getAuthHeaders(),
    credentials: "include",
  };

  if (body && (httpMethod === "POST" || httpMethod === "PUT" || httpMethod === "PATCH")) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Ensure queryKey is properly formatted
    const url = Array.isArray(queryKey) ? queryKey.join("/") : String(queryKey);
    console.log('Query request to:', url);
    
    const res = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
