import createClient, { type RequestOptions, type Middleware } from "openapi-fetch";

export type SdkClient = ReturnType<typeof createClient<any>>;

export type CreateSdkOptions = {
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  headers?: Record<string, string>;
  middleware?: Middleware[];
};

export function createSdkClient(options: CreateSdkOptions = {}): SdkClient {
  const { baseUrl = "", fetch: customFetch, headers = {}, middleware = [] } = options;
  return createClient<any>({
    baseUrl,
    fetch: customFetch,
    headers,
  });
}

export type { RequestOptions };

