export type Where<T> = Partial<Record<keyof T, any>>;

export interface DatabaseAdapter<T> {
    findOne(args: { where: Where<Partial<T>> }): Promise<T | null>;
    findMany(args: { where?: Where<Partial<T>> }): Promise<T[]>;
    create(args: { data: T | Omit<T, "id"> }): Promise<T>;
    update(args: { where: Where<T>; data: Partial<T> }): Promise<T | null>;
    delete(args: { where: Where<T> }): Promise<T | null>;
}