import { JsonFileAdapter } from "@/adapters/database";
import { NoopLogger } from "@/adapters/logging/noop";
import SimpleEventBus from "@/adapters/events";

// Poor-man's dependency injection
// Problems with this:
// - Global state
// - Difficult to test
// - Difficult to mock
// - Difficult to extend
// - Difficult to reuse

export const Logger = NoopLogger;
export const Database = JsonFileAdapter;
export const EventBus = SimpleEventBus;

// Export instances for use in other files
export const logger = new Logger();
export const database = new Database("db.json", logger);
export const eventBus = new EventBus(logger);
