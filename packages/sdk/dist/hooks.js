export function createQueryHelpers(client, queryClient) {
    return {
        // Example helper to prefetch list endpoints generically
        prefetch: async (key, fetcher) => {
            return queryClient.prefetchQuery({ queryKey: key, queryFn: fetcher });
        },
    };
}
// Users can build their own hooks in-app with the typed client. We expose a small factory.
