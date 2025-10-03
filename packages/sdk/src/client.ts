import createClient, { type RequestOptions, type Middleware } from "openapi-fetch";
import type { paths } from "./types";

export type SdkClient = ReturnType<typeof createClient<paths>>;

export type CreateSdkOptions = {
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  headers?: Record<string, string>;
  middleware?: Middleware[];
};

export function createSdkClient(options: CreateSdkOptions = {}): SdkClient {
  const { baseUrl = "", fetch: customFetch, headers = {}, middleware = [] } = options;
  return createClient<paths>({
    baseUrl,
    fetch: customFetch,
    headers,
    middleware,
  });
}

export type { RequestOptions };

