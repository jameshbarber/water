
// Generic I/O schema provider
export interface EntitySchema<TCreate, TRead, TUpdate, TQuery> {
    create: import("zod").ZodType<TCreate>;
    read: import("zod").ZodType<TRead>;
    update: import("zod").ZodType<TUpdate>;
    query?: import("zod").ZodType<TQuery>;
}

export interface SchemaProvider {
    getSchema(entityName: string): EntitySchema<any, any, any, any> | undefined;
    listSchemas(): string[];
}
