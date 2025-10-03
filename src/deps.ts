// deps.ts
import { Logger } from "./core/dependencies/logger";
import { EventBus } from "./core/dependencies/events";
import { AppManifest, StoreConfiguration } from "./core/app";
import {SimpleEventBus, ConsoleLogger, OpenAPIDocGenerator, McpServer, ExpressServerAdapter} from "./adapters";
import { ServerAdapter } from "./core/dependencies";
import { Database, DocumentGenerator, McpServerAdapter } from "./core/dependencies";
import { DrizzleDatabase, JsonDatabase, CsvDatabase, PostgresDatabase } from "./adapters/database";

export type Deps = {
  logger: Logger;
  eventBus: EventBus;
  rest?: ServerAdapter;
  mcp?: McpServerAdapter;
  database: Database;
  driver?: any;
  docs?: DocumentGenerator
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
  const mcp = new McpServer({ logger, eventBus, database }, manifest.name, manifest.version);

  const docs = new OpenAPIDocGenerator();
  return { logger, eventBus, rest, mcp, database, docs };
}