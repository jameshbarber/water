import createClient, {} from "openapi-fetch";
export function createSdkClient(options = {}) {
    const { baseUrl = "", fetch: customFetch, headers = {}, middleware = [] } = options;
    return createClient({
        baseUrl,
        fetch: customFetch,
        headers,
    });
}
