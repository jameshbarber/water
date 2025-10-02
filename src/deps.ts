// deps.ts
import { Logger } from "./core/dependencies/logger";
import { DatabaseAdapter } from "./core/dependencies/db";
import { EventBus } from "./core/dependencies/events";
import { AppManifest } from "./core/app";
import { CsvFileAdapter } from "./adapters/database/csv";
import { JsonFileAdapter } from "./adapters/database/json";
import SimpleEventBus from "./adapters/events";
import { ServerAdapter } from "./core/dependencies/interfaces";
import type { McpServerAdapter } from "./core/dependencies/interfaces/mcp";
import NodeMcpServerAdapter from "./adapters/mcp";
import { ExpressServerAdapter } from "./adapters/rest/express";
import { ConsoleLogger } from "./adapters/logging/console";

export type Deps = { 
    logger: Logger; 
    db: DatabaseAdapter<any>; 
    eventBus: EventBus; 
    rest?: ServerAdapter;
    mcp?: McpServerAdapter;
};

export function createDeps(manifest: AppManifest): Deps {
  const logger = new ConsoleLogger();
  const db = manifest.dependencies.db === "csv"
    ? new CsvFileAdapter("db.csv", logger)
    : new JsonFileAdapter("db.json", logger); // db depends on logger
  const eventBus = new SimpleEventBus(logger);
  const rest = new ExpressServerAdapter({ logger, db, eventBus }, 3000, "0.0.0.0");
  const mcp = new NodeMcpServerAdapter({ logger, db, eventBus }, manifest.name, manifest.version);
  // Example tool: ping
  mcp.registerTool({
    name: "ping",
    description: "Health check tool that returns pong",
    inputSchema: { type: "object", properties: { message: { type: "string" } } },
    handler: async (input: { message?: string }) => ({ pong: input?.message ?? "ok" })
  });
  return { logger, db, eventBus, rest, mcp };
}