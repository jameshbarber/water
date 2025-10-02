
// Generic I/O schema provider
export interface EntitySchema<TCreate, TRead, TQuery> {
    create: import("zod").ZodType<TCreate>;
    read: import("zod").ZodType<TRead>;
    query?: import("zod").ZodType<TQuery>;
}

export interface SchemaProvider {
    getSchema(entityName: string): EntitySchema<any, any, any> | undefined;
    listSchemas(): string[];
}
