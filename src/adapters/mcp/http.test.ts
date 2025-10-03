describe("McpHttpAdapter route → tool generation", () => {
    const makeDeps = () => ({
        logger: { info: jest.fn(), error: jest.fn() } as any,
        db: {} as any,
        eventBus: { emit: jest.fn() } as any,
    });

    const makeRest = (routes: any[]) => {
        return {
            use: jest.fn(),
            mountRoutes: jest.fn(),
            getRoutes: jest.fn(() => routes),
            createRoute: jest.fn(),
            start: jest.fn(),
        } as any;
    };

    beforeEach(() => {
        jest.resetModules();
    });

    it("registers MCP tools for REST routes with correct names and required inputs", async () => {
        // Arrange routes
        const routes = [
            { method: "get", path: "/devices", summary: "List devices", description: "", handler: jest.fn(async (_req: any, res: any) => res.json([])) },
            { method: "get", path: "/devices/:id", summary: "Get device", description: "", handler: jest.fn(async (_req: any, res: any) => res.json({})) },
            { method: "post", path: "/devices", summary: "Create device", description: "", inputSchemas: { body: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } }, handler: jest.fn(async (_req: any, res: any) => res.status(201).json({})) },
        ];

        const rest = makeRest(routes);
        const deps = makeDeps();

        // Capture tools added to the MCP server
        const registeredTools: { name: string; def: any; handler: Function }[] = [];

        jest.doMock("@modelcontextprotocol/sdk/server/mcp.js", () => ({
            McpServer: jest.fn().mockImplementation(() => ({
                tool: (name: string, def: any, handler: Function) => {
                    registeredTools.push({ name, def, handler });
                },
                connect: jest.fn().mockResolvedValue(undefined),
            })),
        }));

        jest.doMock("@modelcontextprotocol/sdk/server/streamableHttp.js", () => ({
            StreamableHTTPServerTransport: jest.fn().mockImplementation(() => ({
                handleRequest: jest.fn(),
            })),
        }));

        // Act
        const { default: McpHttpAdapter } = await import("./http");
        const adapter = new McpHttpAdapter(deps as any, rest as any, "test", "1.0.0");
        adapter.start();

        // Assert names
        expect(registeredTools.map(t => t.name)).toEqual(
            expect.arrayContaining([
                "rest.get.devices",
                "rest.get.devices_id",
                "rest.post.devices",
            ])
        );

        // Assert required fields inferred
        const listDef = registeredTools.find(t => t.name === "rest.get.devices")!.def;
        expect(listDef.inputSchema.required).toContain("query");

        const getDef = registeredTools.find(t => t.name === "rest.get.devices_id")!.def;
        expect(getDef.inputSchema.required).toContain("params");
        expect(getDef.inputSchema.properties.params).toBeTruthy();

        const createDef = registeredTools.find(t => t.name === "rest.post.devices")!.def;
        expect(createDef.inputSchema.required).toContain("body");
        // Body schema should carry through from route
        expect(createDef.inputSchema.properties.body.properties.id.type).toBe("string");
    });

    it("passes through undefined inputSchema for manually-registered tools (no empty defaults)", async () => {
        const routes: any[] = [];
        const rest = makeRest(routes);
        const deps = makeDeps();

        const registeredTools: { name: string; def: any; handler: Function }[] = [];

        jest.doMock("@modelcontextprotocol/sdk/server/mcp.js", () => ({
            McpServer: jest.fn().mockImplementation(() => ({
                tool: (name: string, def: any, handler: Function) => {
                    registeredTools.push({ name, def, handler });
                },
                connect: jest.fn().mockResolvedValue(undefined),
            })),
        }));

        jest.doMock("@modelcontextprotocol/sdk/server/streamableHttp.js", () => ({
            StreamableHTTPServerTransport: jest.fn().mockImplementation(() => ({ handleRequest: jest.fn() })),
        }));

        const { default: McpHttpAdapter } = await import("./http");
        const adapter = new McpHttpAdapter(deps as any, rest as any, "test", "1.0.0");
        adapter.registerTool({ name: "no-input", description: "test", handler: async () => ({ ok: true }) } as any);
        adapter.start();

        const def = registeredTools.find(t => t.name === "no-input")!.def;
        expect(def.inputSchema).toBeUndefined();
    });
});


