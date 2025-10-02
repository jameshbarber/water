import { DatabaseAdapter } from "./dependencies/db";
import express from "express";
import { Logger } from "./dependencies/logger";
import EventBus from "@/adapters/events";
import Module from "./modules/module";

interface ModuleConfig {
    [key: string]: Module;
}

class App {

    name: string;
    app: express.Application;
    database: DatabaseAdapter<any>;
    logger: Logger;
    eventBus: EventBus;
    moduleConfigs: ModuleConfig = {};

    constructor(name: string, database: DatabaseAdapter<any>, logger: Logger, eventBus: EventBus) {
        this.name = name;
        this.app = express();
        this.database = database;
        this.logger = logger;
        this.eventBus = eventBus;
    }

    register(module: Module) {
        this.moduleConfigs[module.name] = module;
    }

    start() {
        this.app.listen(3000, () => {
            this.logger.info(`${this.name} is running on port 3000`);
        });
    }

    getApp() {
        return this.app;
    }

}


export default App;

