import { AppInterface } from "../types";
import type { Deps } from "@/deps";
import { McpServerAdapter, McpTool } from "./types";

class McpInterface extends AppInterface {
    server: McpServerAdapter;
    deps: Deps;

    constructor(name: string, version: string, server: McpServerAdapter, deps: Deps) {
        super(name, version);
        this.server = server;
        this.deps = deps;
    }

    registerTool(tool: McpTool) {
        this.server.registerTool(tool);
    }

    initialize() {
        this.server.start();
    }
}

export { Deps, McpInterface, McpServerAdapter, McpTool };