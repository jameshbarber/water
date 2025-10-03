import createClient, { type RequestOptions, type Middleware } from "openapi-fetch";
export type SdkClient = ReturnType<typeof createClient<any>>;
export type CreateSdkOptions = {
    baseUrl?: string;
    fetch?: typeof globalThis.fetch;
    headers?: Record<string, string>;
    middleware?: Middleware[];
};
export declare function createSdkClient(options?: CreateSdkOptions): SdkClient;
export type { RequestOptions };
