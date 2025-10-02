import { SchemaProvider, EntitySchema } from "./types";


// Simple Zod-based schema provider for JSON-backed entities
export class ZodSchemaProvider implements SchemaProvider {
    private entitySchemas: Map<string, EntitySchema<any, any, any>>;

    constructor(schema?: EntitySchema<any, any, any>) {
        this.entitySchemas = new Map(Object.entries(schema ?? {}));
    }

    create<TC, TR = TC, TQ = Partial<TR>>(name: string, schema: {
        create: import("zod").ZodType<TC>;
        read?: import("zod").ZodType<TR>;
        query?: import("zod").ZodType<TQ>;
    }): void {
        const entity: EntitySchema<TC, TR, TQ> = {
            create: schema.create,
            read: (schema.read ?? schema.create) as import("zod").ZodType<TR>,
            query: schema.query
        };
        this.entitySchemas.set(name, entity);
    }

    getSchema(entityName: string): EntitySchema<any, any, any> | undefined {
        return this.entitySchemas.get(entityName);
    }

    listSchemas(): string[] {
        return Array.from(this.entitySchemas.keys());
    }
}
