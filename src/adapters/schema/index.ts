import { SchemaProvider, EntitySchema } from "./types";
import { z } from "zod";

// Zod-based provider for a single table/entity schema
export class ZodSchemaProvider implements SchemaProvider<any> {
    private entity: EntitySchema<any, any, any, any>;

    constructor(schema?: z.ZodObject) {
        const base = schema ?? z.object({});
        this.entity = {
            create: base.partial(),
            read: base,
            update: base.partial(),
            query: base.partial(),
        } as EntitySchema<any, any, any, any>;
    }

    getSchema(): EntitySchema<any, any, any, any> | undefined {
        return this.entity;
    }
}
