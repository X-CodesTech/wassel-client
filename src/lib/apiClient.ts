import { QueryClient, QueryFunction } from "@tanstack/react-query";

// This file defines API client functions that will be used to make requests to the server
// It is specific to the client application and handles server communication

// Define the base URL for API requests
// Change this to your backend server URL when integrating with your own backend
// This should be updated to point to your backend server URL
const API_BASE_URL = '';  // Empty string means same origin

// To set a different API URL, uncomment and modify the following line
// const API_BASE_URL = 'https://your-backend-server.com/api';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Make an API request to the server
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Ensure the URL has the correct prefix
  const apiUrl = url.startsWith('/api') ? url : `/api${url}`;
  
  const res = await fetch(`${API_BASE_URL}${apiUrl}`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Create a query function for TanStack Query
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const urlKey = queryKey[0] as string;
    // Ensure the URL has the correct prefix
    const apiUrl = urlKey.startsWith('/api') ? urlKey : `/api${urlKey}`;

    const res = await fetch(`${API_BASE_URL}${apiUrl}`, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

/**
 * Configure query client with default options
 */
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