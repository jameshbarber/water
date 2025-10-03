import { Where } from "@/core/dependencies/db";
import AppError from "@/core/error";
import { Route } from "@/core/dependencies/interfaces/rest";
import { Deps } from "@/deps";
import { SchemaProvider } from "@/adapters/schema/types";
import { z } from "zod";

export interface ModuleManifestConfig {
    name: string;
}

export interface ModuleConfig<T> extends ModuleManifestConfig {
    schemas?: SchemaProvider<T>;
    // tolerate shorthand in tests/manifests
    schema?: string;
    store?: string;
}

export default class Module<T extends { id: string }> {

    name: string;
    deps: Deps;
    schemas: SchemaProvider<T>;
    config: ModuleManifestConfig;

    constructor(config: ModuleConfig<T>, deps: Deps) {
        this.deps = deps;
        this.name = config.name;
        this.schemas = (config.schemas as any) ?? { getSchema: () => undefined } as any;
        this.config = config;
    }

    async findOne(id: string): Promise<T> {
        const store = this.deps.database.repo<T>((this.schemas as any)?.getTable?.() ?? this.name);
        const result = await store.findOne({
            where: { id } as Where<T>
        })
        if (!result) {
            throw new AppError(`${this.name} ${id} not found`, 404, `${this.name}.not_found`); 
        }
        return result;
    }

    findMany(where: Where<T>): Promise<T[]> {
        const store = this.deps.database.repo<T>((this.schemas as any)?.getTable?.() ?? this.name);
        const schema = this.schemas.getSchema();
        if (schema?.query) (schema.query as z.ZodType<any>).parse(where);
        return store.findMany({ where })
    }

    async create(data: T): Promise<T> {
        const store = this.deps.database.repo<T>((this.schemas as any)?.getTable?.() ?? this.name);
        const schema = this.schemas.getSchema();
        if (schema?.create) (schema.create as z.ZodType<any>).parse(data);
        const val = await store.create({ data })

        this.deps.logger.debug(`Emitting event: ${this.name}.created ${JSON.stringify(val)}`);
        this.deps.eventBus.emit(`${this.name}.created`, val);
        return val;
    }
    
    async update(id: string, data: Partial<T>): Promise<T | null> {
        const store = this.deps.database.repo<T>((this.schemas as any)?.getTable?.() ?? this.name);
        const schema = this.schemas.getSchema();
        if (schema?.update) (schema.update as z.ZodType<any>).parse(data);
        const val = await store.update({ where: { id } as Where<T>, data })
        if (!val) {
            throw new AppError(`${this.name} ${id} not found`, 404, `${this.name}.not_found`);
        }
        this.deps.eventBus.emit(`${this.name}.updated`, val);
        return val;
    }

    async delete(id: string): Promise<T | null> {
        const store = this.deps.database.repo<T>((this.schemas as any)?.getTable?.() ?? this.name);
        const val = await store.delete({ where: { id } as Where<T> })
        if (!val) {
            throw new AppError(`${this.name} ${id} not found`, 404, `${this.name}.not_found`);
        }
        return val;
    }

    addRoute(route: Route) {
        this.deps.rest?.createRoute(route);
    }
}