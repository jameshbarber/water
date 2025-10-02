import type { Deps } from "@/deps";

interface McpTool<Input = any, Output = any> {
    name: string;
    description: string;
    // JSON Schema for input; keep loose to avoid tight coupling to any schema lib
    inputSchema?: Record<string, any>;
    handler: (input: Input, deps: Deps) => Promise<Output> | Output;
}

interface McpServerAdapter {
    registerTool(tool: McpTool): void;
    start(): void;
}

export { McpTool, McpServerAdapter };