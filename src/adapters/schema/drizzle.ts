import type { SchemaProvider, EntitySchema } from "./types";


type DrizzleTable = any;

export class DrizzleSchemaProvider implements SchemaProvider<DrizzleTable> {
    private tables: Map<string, DrizzleTable>;

    constructor(table?: DrizzleTable) {
        this.tables = new Map();
        if (table) {
            // Treat provided table as the default table
            this.tables.set("default", table);
        }
    }

    create(table: DrizzleTable): void {
        this.tables.set("default", table);
    }

    getSchema(): EntitySchema<any, any, any, any> | undefined {
        const table = this.tables.get("default");
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
        } as EntitySchema<any, any, any, any>;
    }

    getTable(): any | undefined {
        return this.tables.get("default");
    }

    listSchemas(): string[] {
        return Array.from(this.tables.keys());
    }
}


