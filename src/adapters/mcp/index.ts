import type { Deps } from "@/deps";
import type { McpServerAdapter, McpTool } from "@/core/dependencies/interfaces/mcp";

export class McpServer implements McpServerAdapter {
    private deps: Deps;
    private name: string;
    private version: string;
    private tools: McpTool[] = [];

    constructor(deps: Deps, name: string, version: string) {
        this.deps = deps;
        this.name = name;
        this.version = version;
    }

    registerTool(tool: McpTool): void {
        this.tools.push(tool);
    }

    start(): void {
        // Lazy-load SDK so project can run even if dependency isn't installed
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const tryRequire = (id: string): any | undefined => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                return require(id);
            } catch (_err) {
                return undefined;
            }
        };

        const serverMod = tryRequire("@modelcontextprotocol/sdk/server");
        const stdioMod = tryRequire("@modelcontextprotocol/sdk/stdio");

        if (!serverMod || !stdioMod) {
            this.deps.logger?.warn(
                "MCP SDK not installed. Skipping MCP server startup. Install '@modelcontextprotocol/sdk' to enable."
            );
            return;
        }

        const { Server } = serverMod as { Server: new (...args: any[]) => any };
        const { StdioServerTransport } = stdioMod as { StdioServerTransport: new (...args: any[]) => any };

        const server = new Server({ name: this.name, version: this.version });

        // Support both server.tool and server.addTool shapes
        const addToolFn: any = (server as any).tool ?? (server as any).addTool;

        this.tools.forEach((tool) => {
            const inputSchema = tool.inputSchema ?? { type: "object", properties: {} };
            addToolFn.call(server, tool.name, { description: tool.description, inputSchema }, async (args: any) => {
                return tool.handler(args, this.deps);
            });
            this.deps.logger?.info?.(`MCP tool registered: ${tool.name}`);
        });

        const transport = new StdioServerTransport();
        const connect = (server as any).connect?.bind(server);
        if (connect) {
            Promise.resolve(connect(transport)).catch((err: any) => {
                this.deps.logger?.error?.(`Failed to start MCP server: ${err?.message ?? err}`);
            });
        }
    }
}

export default McpServer;


