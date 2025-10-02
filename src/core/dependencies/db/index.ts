export type Where<T> = Partial<T>;

export interface DatabaseAdapter<T extends { id: string }> {
    findOne(args: { where: Where<T> }): Promise<T | null>;
    findMany(args: { where?: Where<T> }): Promise<T[]>;
    create(args: { data: T | Omit<T, "id"> }): Promise<T>;
    update(args: { where: Where<T>; data: Partial<T> }): Promise<T | null>;
    delete(args: { where: Where<T> }): Promise<T | null>;
}