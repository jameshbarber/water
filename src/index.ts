import { JsonFileAdapter } from "./adapters/database";
import { NoopLogger } from "./adapters/logging/noop";
import App from "./core/app";
import readings from "@/modules/readings";
import EventBus from "./adapters/events";

const db = new JsonFileAdapter("db.json");
const logger = new NoopLogger();
const eventBus = new EventBus();

const app = new App("my-app", db, logger, eventBus);
app.register(readings);
app.start()