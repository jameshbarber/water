// deps.ts
import { Logger } from "./core/dependencies/logger";
import { EventBus } from "./core/dependencies/events";
import { AppManifest, StoreConfiguration } from "./core/app";
import SimpleEventBus from "./adapters/events";
import { ServerAdapter } from "./core/dependencies/interfaces";
import type { McpServerAdapter } from "./core/dependencies/interfaces/mcp";
import McpHttpAdapter from "./adapters/mcp/http";
import { ExpressServerAdapter } from "./adapters/rest/express";
import { ConsoleLogger } from "./adapters/logging/console";
import { Database } from "./core/dependencies/db";
import { DrizzleDatabase } from "./adapters/database/drizzle";
import { JsonDatabase } from "./adapters/database/json";
import { CsvDatabase } from "./adapters/database/csv";
import { PostgresDatabase } from "./adapters/database/postgres";

export type Deps = {
  logger: Logger;
  eventBus: EventBus;
  rest?: ServerAdapter;
  mcp?: McpServerAdapter;
  database: Database;
  driver?: any;
};


export function createDeps(manifest: AppManifest): Deps {

  const logger = new ConsoleLogger("debug");
  const eventBus = new SimpleEventBus(logger);

  const createDatabase = (config: StoreConfiguration): Database => {
    switch (config.type) {
      case "postgres":
        return new PostgresDatabase(config.url);
      case "drizzle":
        return new DrizzleDatabase();
      case "json":
        return new JsonDatabase(config.url, logger);
      case "csv":
        return new CsvDatabase(config.url, logger);
      default:
        throw new Error(`Invalid store type: ${config.type}`);
    }
  }

  const database = createDatabase(manifest.store ?? { type: "json", url: "data.json" });

  const rest = new ExpressServerAdapter({ logger, eventBus, database });
  const mcp = new McpHttpAdapter({ logger, eventBus, database }, rest, manifest.name, manifest.version);


  return { logger, eventBus, rest, mcp, database };
}