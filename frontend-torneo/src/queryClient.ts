// src/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

// Global QueryClient, can be customized (e.g., retry, staleTime)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      // optimistic updates could be added here
    },
  },
});
