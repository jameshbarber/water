import { DatabaseAdapter } from "@/core/dependencies/db";
import { SchemaProvider } from "@/adapters/schema/types";

interface ModuleConfig {
    name: string;
    store: DatabaseAdapter<any>;
    eventBus: EventBus;
    schema: SchemaProvider;
}

export default class Module {

    name: string;
    store: DatabaseAdapter<any>;
    eventBus: EventBus;
    schema: SchemaProvider;
    
    constructor(config: ModuleConfig) {
        this.store = config.store;
        this.name = config.name;
        this.eventBus = config.eventBus;
        this.schema = config.schema;
    }

    findOne(id: string) {
        return this.store.findOne({
            where: {
                id: id
            }
        })
    }

    findMany(where: any) {
        return this.store.findMany({
            where: where
        })
    }

    create(data: any) {
        return this.store.create({
            data: data
        })
    }
    
    update(id: string, data: any) {
        return this.store.update({
            where: {
                id: id
            },
            data: data
        })
    }

    delete(id: string) {
        return this.store.delete({
            where: {
                id: id
            }
        })
    }
}