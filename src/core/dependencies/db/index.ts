export type Where<T> = Partial<T>;

export interface Repository<T extends { id?: string }> {
    table: string;
    initialize(): Promise<void>;
    findOne(args: { where: Where<T> }): Promise<T | null>;
    findMany(args: { where?: Where<T> }): Promise<T[]>;
    create(args: { data: T | Omit<T, "id"> }): Promise<T>;
    createMany?(args: { data: (T | Omit<T, "id">)[] }): Promise<T[]>;
    update(args: { where: Where<T>; data: Partial<T> }): Promise<T | null>;
    delete(args: { where: Where<T> }): Promise<T | null>;
}

export type Store<T extends { id?: string }> = Repository<T>;

export interface Database {
    initialize(): Promise<void>;
    repo<T extends { id: string }>(source: any, tableName?: string): Repository<T>;
    repository?<T extends { id: string }>(source: any, tableName?: string): Repository<T>;
}