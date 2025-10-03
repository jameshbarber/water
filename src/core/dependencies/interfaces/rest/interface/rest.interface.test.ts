import { RestInterface } from ".";

describe("RestInterface", () => {
    it("should be defined", () => {
        expect(RestInterface).toBeDefined();
    });

    it("should have a server property", () => {
        const restInterface = new RestInterface("test", "1.0.0", {} as any, {} as any);
        expect(restInterface.server).toBeDefined();
    });

    it("should have a deps property", () => {
        const restInterface = new RestInterface("test", "1.0.0", {} as any, {} as any);
        expect(restInterface.deps).toBeDefined();
    });

    it("should have a registerRoute method", () => {
        const restInterface = new RestInterface("test", "1.0.0", {} as any, {} as any);
        expect(restInterface.registerRoute).toBeDefined();
    });

    it("should have a initialize method", () => {
        const restInterface = new RestInterface("test", "1.0.0", {} as any, {} as any);
        expect(restInterface.initialize).toBeDefined();
    });

    it("should start the server", () => {
        const restInterface = new RestInterface("test", "1.0.0", {start: jest.fn()} as any, {} as any);
        restInterface.initialize();
        expect(restInterface.server.start).toHaveBeenCalled();
    });

    it("should register a route with the server", () => {
        const restInterface = new RestInterface("test", "1.0.0", {createRoute: jest.fn()} as any, {} as any);
        restInterface.registerRoute({} as any);
        expect(restInterface.server.createRoute).toHaveBeenCalled();
    });
}); 