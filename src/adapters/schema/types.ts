export interface EntitySchema<TCreate, TRead, TUpdate, TQuery> {
    create: import("zod").ZodType<TCreate>;
    read: import("zod").ZodType<TRead>;
    update: import("zod").ZodType<TUpdate>;
    query: import("zod").ZodType<TQuery>;
}

export interface SchemaProvider<T> {
    getSchema(): EntitySchema<T, T, T, T> | undefined;
}
