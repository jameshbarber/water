import type { QueryClient } from "@tanstack/react-query";
import type { SdkClient } from "./client";

export function createQueryHelpers(client: SdkClient, queryClient: QueryClient) {
  return {
    // Example helper to prefetch list endpoints generically
    prefetch: async (key: unknown[], fetcher: () => Promise<unknown>) => {
      return queryClient.prefetchQuery({ queryKey: key, queryFn: fetcher });
    },
  };
}

// Users can build their own hooks in-app with the typed client. We expose a small factory.

