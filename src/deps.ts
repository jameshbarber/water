// deps.ts
import { Logger } from "./core/dependencies/logger";
import { DatabaseAdapter } from "./core/dependencies/db";
import { EventBus } from "./core/dependencies/events";
import { AppManifest } from "./core/app";

import { NoopLogger } from "./adapters/logging/noop";
import { CsvFileAdapter } from "./adapters/database/csv";
import { JsonFileAdapter } from "./adapters/database/json";
import SimpleEventBus from "./adapters/events";
import { ServerAdapter } from "./core/dependencies/server";

export type Deps = { 
    logger: Logger; 
    db: DatabaseAdapter<any>; 
    eventBus: EventBus; 
    server?: ServerAdapter;
};

export function createDeps(manifest: AppManifest): Deps {
  const logger = new NoopLogger();
  const db = manifest.dependencies.db === "csv"
    ? new CsvFileAdapter("db.csv", logger)
    : new JsonFileAdapter("db.json", logger); // db depends on logger
  const eventBus = new SimpleEventBus(logger);
  const server = new ServerAdapter(null, { logger, db, eventBus });
  return { logger, db, eventBus, server };
}