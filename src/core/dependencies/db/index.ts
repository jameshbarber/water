export type Where<T> = Partial<T>;

export interface Store<T extends { id?: string }> {
    table: string;
    initialize(): Promise<void>;
    findOne(args: { where: Where<T> }): Promise<T | null>;
    findMany(args: { where?: Where<T> }): Promise<T[]>;
    create(args: { data: T | Omit<T, "id"> }): Promise<T>;
    update(args: { where: Where<T>; data: Partial<T> }): Promise<T | null>;
    delete(args: { where: Where<T> }): Promise<T | null>;
}

export interface Database {
    initialize(): Promise<void>;
    repo<T extends { id: string }>(source: any, tableName?: string): Store<T>;
}