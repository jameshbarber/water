import type { SchemaProvider, EntitySchema } from "./types";

// Lightweight wrapper that derives Zod from Drizzle tables when available.
// We avoid importing drizzle-zod at module top-level to keep it optional.

type DrizzleTable = any;

export class DrizzleSchemaProvider implements SchemaProvider {
    private tables: Map<string, DrizzleTable>;

    constructor(tables?: Record<string, DrizzleTable>) {
        this.tables = new Map(Object.entries(tables ?? {}));
    }

    create(name: string, table: DrizzleTable): void {
        this.tables.set(name, table);
    }

    getSchema(entityName: string): EntitySchema<any, any, any> | undefined {
        const table = this.tables.get(entityName);
        if (!table) return undefined;

        // Dynamically load drizzle-zod only when needed
        let createSchema: any;
        let readSchema: any;
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { createInsertSchema, createSelectSchema } = require("drizzle-zod");
            createSchema = createInsertSchema(table);
            readSchema = createSelectSchema(table);
        } catch (err) {
            throw new Error("drizzle-zod is required to derive schemas. Please install it.");
        }

        return {
            create: createSchema,
            read: readSchema,
            // query schema left undefined; callers can provide if needed
        } as EntitySchema<any, any, any>;
    }

    listSchemas(): string[] {
        return Array.from(this.tables.keys());
    }
}


