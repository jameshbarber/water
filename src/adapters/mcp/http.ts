import type { Deps } from "@/deps";
import type { McpServerAdapter, McpTool } from "@/core/dependencies/interfaces/mcp";
import type { ServerAdapter } from "@/core/dependencies/interfaces";
import { McpServer as McpServerSdk } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

export default class McpHttpAdapter implements McpServerAdapter {
    private deps: Deps;
    private rest: ServerAdapter;
    private name: string;
    private version: string;
    private tools: McpTool[] = [];

    constructor(deps: Deps, rest: ServerAdapter, name: string, version: string) {
        this.deps = deps;
        this.rest = rest;
        this.name = name;
        this.version = version;
    }

    registerTool(tool: McpTool): void {
        this.tools.push(tool);
    }

    private sanitizeToolNamePart(input: string): string {
        return input
            .replace(/^\//, "")
            .replace(/\//g, "_")
            .replace(/[:{}]/g, "")
            .replace(/[^a-zA-Z0-9_\-]/g, "_");
    }

    private generateToolsFromRoutes(): McpTool[] {
        const getRoutes = (this.rest as any).getRoutes?.bind(this.rest);
        if (!getRoutes) return [];

        const routes = getRoutes() as any[];
        return routes.map((route) => {
            const nameParts = ["rest", route.method, this.sanitizeToolNamePart(route.path)];
            const toolName = nameParts.filter(Boolean).join(".");
            const description = route.summary || route.description || `Invoke ${route.method.toUpperCase()} ${route.path}`;

            const requiresIdParam = /\/:\w+/.test(route.path);
            const requiresBody = ["post", "put", "patch"].includes(route.method);
            const requiresQuery = route.method === "get" && !requiresIdParam;
            const required: string[] = [];
            if (requiresIdParam) required.push("params");
            if (requiresBody) required.push("body");
            if (requiresQuery) required.push("query");

            const inputSchemaFromRoute = route.inputSchemas;
            const inputSchema = {
                type: "object",
                properties: {
                    params: inputSchemaFromRoute?.params ?? { type: "object", additionalProperties: true },
                    query: inputSchemaFromRoute?.query ?? { type: "object", additionalProperties: true },
                    body: inputSchemaFromRoute?.body ?? { type: "object", additionalProperties: true },
                    headers: { type: "object", additionalProperties: true },
                },
                additionalProperties: false,
                required: required.length ? required : undefined,
            } as Record<string, any>;

            const handler = async (args: any) => {
                const req = {
                    params: (args && args.params) || {},
                    query: (args && args.query) || {},
                    body: (args && args.body) || {},
                    headers: (args && args.headers) || {},
                } as any;

                let capturedStatus = 200;
                let resolved = false;
                const res = {
                    status: (code: number) => {
                        capturedStatus = code;
                        return res;
                    },
                    json: (data: any) => {
                        resolved = true;
                        return { status: capturedStatus, data };
                    },
                    send: (data: any) => {
                        resolved = true;
                        return { status: capturedStatus, data };
                    },
                    setHeader: (_k: string, _v: any) => {},
                } as any;

                try {
                    const out = await route.handler(req, res);
                    if (resolved && out && typeof out === "object" && "status" in out && "data" in out) {
                        return out;
                    }
                    if (out && typeof out === "object" && "status" in out && "data" in out) {
                        return out;
                    }
                    return { status: capturedStatus, data: out ?? null };
                } catch (err: any) {
                    const status = err?.status ?? 500;
                    const code = err?.code ?? "internal_error";
                    const message = err?.message ?? "Internal Server Error";
                    const details = err?.details;
                    this.deps.logger?.error?.(`[MCP] ${route.method.toUpperCase()} ${route.path} -> ${status} ${code}: ${message}`);
                    return { status, data: { code, message, details } };
                }
            };

            return { name: toolName, description, inputSchema, handler } as McpTool;
        });
    }

    start(): void {
        const server = new McpServerSdk({ name: this.name, version: this.version });

        const addToolFn: any = (server as any).tool ?? (server as any).addTool;
        const generated = this.generateToolsFromRoutes();
        const allTools: McpTool[] = [...this.tools, ...generated];

        allTools.forEach((tool) => {
            const inputSchema = tool.inputSchema;
            addToolFn.call(server, tool.name, { description: tool.description, inputSchema }, async (_args: any) => {
                return tool.handler(_args, this.deps);
            });
            this.deps.logger?.info?.(`MCP tool registered: ${tool.name}`);
        });

        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        Promise.resolve(server.connect(transport)).catch((err) => {
            this.deps.logger?.error?.(`Failed to initialize MCP HTTP transport: ${err?.message ?? err}`);
        });

        this.rest.createRoute({
            path: "/mcp",
            summary: "MCP endpoint (HTTP)",
            description: "Model Context Protocol endpoint (Streamable HTTP)",
            method: "post",
            handler: async (req: any, res: any) => {
                await (transport as any).handleRequest(req, res, req.body);
            }
        });

        this.rest.createRoute({
            path: "/mcp",
            summary: "MCP stream (SSE)",
            description: "Model Context Protocol SSE stream",
            method: "get",
            handler: async (req: any, res: any) => {
                await (transport as any).handleRequest(req, res);
            }
        });

        this.deps.logger?.info?.("Mounted MCP HTTP endpoint at /mcp");
    }
}


