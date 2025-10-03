
// Generic I/O schema provider
export interface EntitySchema<TCreate, TRead, TQuery> {
    create: import("zod").ZodType<TCreate>;
    read: import("zod").ZodType<TRead>;
    query?: import("zod").ZodType<TQuery>;
}

export interface SchemaProvider<T> {
    getSchema(entityName?: string): EntitySchema<T, T, Partial<T>> | undefined;
    listSchemas(): string[];
}
