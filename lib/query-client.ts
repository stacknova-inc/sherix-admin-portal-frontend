import { QueryClient } from "@tanstack/react-query";

let activeQueryClient: QueryClient | null = null;

export function registerQueryClient(queryClient: QueryClient) {
  activeQueryClient = queryClient;
  return () => {
    if (activeQueryClient === queryClient) activeQueryClient = null;
  };
}

export function clearProtectedQueryCache() {
  activeQueryClient?.clear();
}

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });
}
