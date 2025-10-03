// deps.ts
import { Logger } from "./core/dependencies/logger";
import { EventBus } from "./core/dependencies/events";
import { AppManifest, StoreConfiguration } from "./core/app";
import { SimpleEventBus } from "./adapters/events";
import { ConsoleLogger } from "./adapters/logging/console";
import { OpenAPIDocGenerator, ExpressServerAdapter } from "./adapters/rest";
import { McpServer } from "./adapters/mcp";
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

  const docs = new OpenAPIDocGenerator("http://localhost:4000");
  const rest = new ExpressServerAdapter({ logger, eventBus, database, docs });
  const mcp = new McpServer({ logger, eventBus, database }, manifest.name, manifest.version);

  return { logger, eventBus, rest, mcp, database, docs };
}