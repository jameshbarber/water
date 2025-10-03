import type { QueryClient } from "@tanstack/react-query";
import type { SdkClient } from "./client";
export declare function createQueryHelpers(client: SdkClient, queryClient: QueryClient): {
    prefetch: (key: unknown[], fetcher: () => Promise<unknown>) => Promise<void>;
};
