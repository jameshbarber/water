import { McpServer } from "./index";
import { makeDbSchema, makeEventBus, makeLogger} from "@/test/mocks"

describe("McpServer", () => {
    const mockDeps = {
        schema: makeDbSchema(),
        eventBus: makeEventBus(),
        db: makeDbSchema(),
        logger: makeLogger()
    };

    const mockTool = {
        name: "test-tool",
        description: "Test tool",
        handler: jest.fn()
    };

    it("should register tools", () => {
        const server = new McpServer(mockDeps, "test-app", "1.0.0");
        server.registerTool(mockTool);
        expect(server["tools"]).toContain(mockTool);
    });

    it("should handle missing logger gracefully", () => {
        const server = new McpServer({} as any, "test-app", "1.0.0");
        expect(() => server.start()).not.toThrow();
    });

    it("should register tool handlers with default schema", () => {
        jest.doMock("@modelcontextprotocol/sdk/server/mcp", () => ({
            Server: jest.fn().mockImplementation(() => ({
                tool: jest.fn(),
                connect: jest.fn().mockResolvedValue(undefined)
            }))
        }));

        jest.doMock("@modelcontextprotocol/sdk/server/stdio", () => ({
            StdioServerTransport: jest.fn()
        }));

        const server = new McpServer(mockDeps, "test-app", "1.0.0");
        server.registerTool(mockTool);
        server.start();

        expect(mockDeps.logger.info).toHaveBeenCalledWith(
            expect.stringContaining("MCP tool registered: test-tool")
        );
    });
});
