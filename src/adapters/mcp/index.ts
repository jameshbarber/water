import type { Deps } from "@/deps";
import type { McpServerAdapter, McpTool } from "@/core/dependencies/interfaces/mcp";
import { McpServer as McpServerSdk } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';


export class McpServer implements McpServerAdapter {
    private deps: Deps;
    private name: string;
    private version: string;
    private tools: McpTool[] = [];
    private server?: McpServerSdk;

    constructor(deps: Deps, name: string, version: string) {
        this.deps = deps;
        this.name = name;
        this.version = version;
        
    }

    registerTool(tool: McpTool): void {
        this.tools.push(tool);
    }

    start(): void {
        this.server = new McpServerSdk({ name: this.name, version: this.version });

        if (!this.server) {
            return;
        }
        // Support both server.tool and server.addTool shapes
        const addToolFn: any = (this.server as any).tool ?? (this.server as any).addTool;

        this.tools.forEach((tool) => {
            const inputSchema = tool.inputSchema ?? { type: "object", properties: {} };
            addToolFn.call(this.server, tool.name, { description: tool.description, inputSchema }, async (args: any) => {
                return tool.handler(args, this.deps);
            });
            this.deps.logger?.info?.(`MCP tool registered: ${tool.name}`);
        });

        const transport = new StdioServerTransport();
        const connect = this.server.connect?.bind(this.server);
        if (connect) {
            Promise.resolve(connect(transport)).catch((err: any) => {
                this.deps.logger?.error?.(`Failed to start MCP server: ${err?.message ?? err}`);
            });
        }
    }
}



