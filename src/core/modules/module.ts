import { DatabaseAdapter, Where } from "@/core/dependencies/db";
import { SchemaProvider } from "@/adapters/schema/types";
import { EventBus } from "@/core/dependencies/events";
import AppError from "../error";

export interface ModuleConfig<T extends { id: string }> {
    name: string;
    store: DatabaseAdapter<T>;
    eventBus: EventBus;
    schema: SchemaProvider;
}

export default class Module<T extends { id: string }> {

    name: string;
    store: DatabaseAdapter<T>;
    eventBus: EventBus;
    schema: SchemaProvider;
    
    constructor(config: ModuleConfig<T>) {
        this.store = config.store;
        this.name = config.name;
        this.eventBus = config.eventBus;
        this.schema = config.schema;
    }

    async findOne(id: string): Promise<T> {
        const result = await this.store.findOne({
            where: { id } as Where<T>
        })
        if (!result) {
            throw new AppError(`${this.name} ${id} not found`); 
        }
        return result;
    }

    findMany(where: Where<T>): Promise<T[]> {
        return this.store.findMany({
            where: where
        })
    }

    create(data: T): Promise<T> {
        const val = this.store.create({
            data: data
        })

        this.eventBus.emit(`${this.name}.created`, val);
        return val;
    }
    
    async update(id: string, data: Partial<T>): Promise<T | null> {
        const val = await this.store.update({
            where: { id } as Where<T>,
            data: data
        })
        if (val) {
            this.eventBus.emit(`${this.name}.updated`, val);
        }
        return val;
    }

    async delete(id: string): Promise<T | null> {
        return this.store.delete({
            where: { id } as Where<T>
        })
    }
}