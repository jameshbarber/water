import { DatabaseAdapter, Where } from "@/core/dependencies/db";
import { SchemaProvider } from "@/adapters/schema/types";
import { EventBus } from "@/core/dependencies/events";
import AppError from "@/core/error";
import App from "@/core/app";
import { Route } from "@/core/dependencies/interfaces/rest";
import { Logger } from "@/core/dependencies/logger";

export interface ModuleConfig<T extends { id: string }> {
    name: string;
    store: DatabaseAdapter<T>;
    eventBus: EventBus;
    schema: SchemaProvider;
    app?: App;   
    logger: Logger;
}

export default class Module<T extends { id: string }> {

    name: string;
    store: DatabaseAdapter<T>;
    eventBus: EventBus;
    schema: SchemaProvider;
    app?: App;
    logger?: Logger;
    
    constructor(config: ModuleConfig<T>) {
        this.store = config.store;
        this.name = config.name;
        this.eventBus = config.eventBus;
        this.schema = config.schema;
        this.app = config.app;
        this.logger = config.logger;
    }

    async findOne(id: string): Promise<T> {
        const result = await this.store.findOne({
            where: { id } as Where<T>
        })
        if (!result) {
            throw new AppError(`${this.name} ${id} not found`, 404, `${this.name}.not_found`); 
        }
        return result;
    }

    findMany(where: Where<T>): Promise<T[]> {
        return this.store.findMany({
            where: where
        })
    }

    async create(data: T): Promise<T> {
        const val = await this.store.create({
            data: data
        })
        if (this?.logger?.debug) {  
            this.logger.debug(`Emitting event: ${this.name}.created ${JSON.stringify(val)}`);
        }
        this.eventBus.emit(`${this.name}.created`, val);
        return val;
    }
    
    async update(id: string, data: Partial<T>): Promise<T | null> {
        const val = await this.store.update({
            where: { id } as Where<T>,
            data: data
        })
        if (!val) {
            throw new AppError(`${this.name} ${id} not found`, 404, `${this.name}.not_found`);
        }
        this.eventBus.emit(`${this.name}.updated`, val);
        return val;
    }

    async delete(id: string): Promise<T | null> {
        const val = await this.store.delete({
            where: { id } as Where<T>
        })
        if (!val) {
            throw new AppError(`${this.name} ${id} not found`, 404, `${this.name}.not_found`);
        }
        return val;
    }

    addRoute(route: Route) {
        this.app?.deps.rest?.createRoute(route);
    }
}