import { Where } from "@/core/dependencies/db";
import AppError from "@/core/error";
import { Route } from "@/core/dependencies/interfaces/rest";
import { Deps } from "@/deps";
import { SchemaProvider } from "../dependencies";
import { z } from "zod";

export interface ModuleManifestConfig {
    name: string;
}

export interface ModuleConfig<T> extends ModuleManifestConfig {
    schema?: SchemaProvider<T>;
    store?: string;
    buffer?: { enabled?: boolean; intervalMs?: number; maxItems?: number };
}

export default class Module<T extends { id: string }> {

    name: string;
    deps: Deps;
    schemas: SchemaProvider<T>;
    config: ModuleConfig<T>;
    customRoutes: Route[] = [];

    constructor(config: ModuleConfig<T>, deps: Deps) {
        this.deps = deps;
        this.name = config.name;
        this.schemas = (config.schema as any) || ({ getSchema: () => undefined } as any);
        this.config = config;
        if (this.config.buffer?.enabled && this.deps.buffer) {
            const interval = this.config.buffer.intervalMs ?? 0;
            const bucket = this.name;
            this.deps.buffer.setFlushHandler(bucket, async (items: any[]) => {
                const tableSource = (this.schemas as any)?.getTable?.();
                const store = tableSource
                    ? this.deps.database.repo<T>(tableSource, this.name)
                    : this.deps.database.repo<T>(undefined, this.name);
                if (typeof (store as any).createMany === "function" && items.length) {
                    await (store as any).createMany({ data: items });
                } else {
                    for (const it of items) {
                        await store.create({ data: it as any });
                    }
                }
            });
            if (interval > 0) this.deps.buffer.start(bucket, interval);
            const maxItems = this.config.buffer.maxItems;
            if (typeof maxItems === "number" && maxItems > 0 && (this.deps.buffer as any).setThreshold) {
                (this.deps.buffer as any).setThreshold(bucket, maxItems);
            }
        }
    }

    async findOne(id: string): Promise<T> {
        const tableSource = (this.schemas as any)?.getTable?.();
        const store = tableSource
            ? this.deps.database.repo<T>(tableSource, this.name)
            : this.deps.database.repo<T>(undefined, this.name);
        const result = await store.findOne({
            where: { id } as Where<T>
        })
        if (!result) {
            throw new AppError(`${this.name} ${id} not found`, 404, `${this.name}.not_found`); 
        }
        return result;
    }

    findMany(where: Where<T>): Promise<T[]> {
        const tableSource = (this.schemas as any)?.getTable?.();
        const store = tableSource
            ? this.deps.database.repo<T>(tableSource, this.name)
            : this.deps.database.repo<T>(undefined, this.name);
        const schema = this.schemas.getSchema();
        if (schema?.query) (schema.query as z.ZodType<any>).parse(where);
        return store.findMany({ where })
    }

    async create(data: T): Promise<T> {
        const tableSource = (this.schemas as any)?.getTable?.();
        const store = tableSource
            ? this.deps.database.repo<T>(tableSource, this.name)
            : this.deps.database.repo<T>(undefined, this.name);
        const schema = this.schemas.getSchema();
        if (schema?.create) (schema.create as z.ZodType<any>).parse(data);
        if (this.config.buffer?.enabled && this.deps.buffer) {
            this.deps.buffer.enqueue(this.name, data);
            this.deps.eventBus.emit(`${this.name}.created`, data);
            return data;
        }
        const val = await store.create({ data })

        this.deps.logger.debug(`Emitting event: ${this.name}.created ${JSON.stringify(val)}`);
        this.deps.eventBus.emit(`${this.name}.created`, val);
        return val;
    }

    async createMany(data: T[]): Promise<T[]> {
        const tableSource = (this.schemas as any)?.getTable?.();
        const store = tableSource
            ? this.deps.database.repo<T>(tableSource, this.name)
            : this.deps.database.repo<T>(undefined, this.name);
        const schema = this.schemas.getSchema();
        if (schema?.create) {
            for (const d of data) (schema.create as z.ZodType<any>).parse(d);
        }
        if (this.config.buffer?.enabled && this.deps.buffer) {
            for (const d of data) this.deps.buffer.enqueue(this.name, d);
            return data;
        }
        if (typeof (store as any).createMany === "function") {
            return await (store as any).createMany({ data });
        }
        const out: T[] = [];
        for (const d of data) out.push(await store.create({ data: d }));
        return out;
    }
    
    async update(id: string, data: Partial<T>): Promise<T | null> {
        const tableSource = (this.schemas as any)?.getTable?.();
        const store = tableSource
            ? this.deps.database.repo<T>(tableSource, this.name)
            : this.deps.database.repo<T>(undefined, this.name);
        const schema = this.schemas.getSchema();
        if (schema?.create) (schema.create as z.ZodType<any>).parse(data);
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
        this.customRoutes.push(route);
    }
}