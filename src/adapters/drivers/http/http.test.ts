import { HttpDriver } from "./index";

describe("HttpDriver", () => {
    let http: HttpDriver;
    let mockFetch: jest.Mock;

    beforeEach(() => {
        mockFetch = jest.fn();
        global.fetch = mockFetch;
        http = new HttpDriver({} as any);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("read", () => {
        it("fetches from the given URL and returns JSON response", async () => {
            const mockResponse = { data: "test" };
            mockFetch.mockResolvedValueOnce({
                json: () => Promise.resolve(mockResponse)
            });

            const result = await http.read({ url: "http://test.com/endpoint", method: "GET", headers: {}, body: {} });

            expect(mockFetch).toHaveBeenCalledWith("http://test.com/endpoint", {
                method: "GET",
                headers: {},
                body: JSON.stringify({})
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe("write", () => {
        it("POSTs data to the given URL and returns JSON response", async () => {
            const mockResponse = { success: true };
            const testData = { foo: "bar" };
            mockFetch.mockResolvedValueOnce({
                json: () => Promise.resolve(mockResponse)
            });

            const result = await http.write({ url: "http://test.com/endpoint", method: "POST", headers: {} }, testData);

            expect(mockFetch).toHaveBeenCalledWith("http://test.com/endpoint", {
                method: "POST",
                headers: {},
                body: JSON.stringify(testData)
            });
            expect(result).toEqual(mockResponse);
        });
    });
});
