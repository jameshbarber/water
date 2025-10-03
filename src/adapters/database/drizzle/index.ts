import { Repository, Where } from "@/core/dependencies/db";
import { db } from "./client";
import { AnyPgTable } from "drizzle-orm/pg-core";
import { and, eq, InferInsertModel, InferSelectModel, SQL } from "drizzle-orm";

type RowOf<TTable extends AnyPgTable> = InferSelectModel<TTable> & { id?: string };

export class DrizzleRepository<TTable extends AnyPgTable>
  implements Repository<RowOf<TTable>> {
  table: string;
  private schema: TTable;

  constructor(table: string, schema: TTable) {
    this.table = table;
    this.schema = schema;
  }

  async initialize(): Promise<void> {
    return;
  }

  private pred(where?: Where<RowOf<TTable>>): SQL | undefined {
    if (!where) return undefined;
    const parts = Object.entries(where).map(([k, v]) =>
      // k is a key of the row; map to the Drizzle column and build eq(...)
      eq((this.schema as any)[k], v as any)
    );
    return parts.length ? and(...parts) : undefined;
  }

  async findOne({ where }: { where: Where<RowOf<TTable>> }): Promise<RowOf<TTable> | null> {
    const rows = await db.select().from(this.schema as any).where(this.pred(where)).limit(1);
    return (rows as RowOf<TTable>[])[0] ?? null;
  }

  async findMany({ where }: { where?: Where<RowOf<TTable>> }): Promise<RowOf<TTable>[]> {
    const rows = await db.select().from(this.schema as any).where(this.pred(where));
    return rows as RowOf<TTable>[];
  }

  async create({
    data,
  }: {
    data: RowOf<TTable> | Omit<RowOf<TTable>, "id">;
  }): Promise<RowOf<TTable>> {
    const res = await db
      .insert(this.schema as any)
      .values(data as InferInsertModel<TTable>)
      .returning();
    const rows = Array.isArray(res) ? res : (res as any).rows;
    return (rows?.[0] as RowOf<TTable>);
  }

  async createMany({ data }: { data: (RowOf<TTable> | Omit<RowOf<TTable>, "id">)[] }): Promise<RowOf<TTable>[]> {
    if (!Array.isArray(data) || data.length === 0) return [] as RowOf<TTable>[];
    const res = await db
      .insert(this.schema as any)
      .values(data as InferInsertModel<TTable>[]) 
      .returning();
    const rows = Array.isArray(res) ? res : (res as any).rows;
    return (rows as RowOf<TTable>[]);
  }

  async update({
    where,
    data,
  }: {
    where: Where<RowOf<TTable>>;
    data: Partial<RowOf<TTable>>;
  }): Promise<RowOf<TTable> | null> {
    const res = await db
      .update(this.schema as any)
      .set(data as any)
      .where(this.pred(where)!)
      .returning();
    const rows = Array.isArray(res) ? res : (res as any).rows;
    return ((rows?.[0] as RowOf<TTable>) ?? null);
  }

  async delete({ where }: { where: Where<RowOf<TTable>> }): Promise<RowOf<TTable> | null> {
    const res = await db.delete(this.schema as any).where(this.pred(where)!).returning();
    const rows = Array.isArray(res) ? res : (res as any).rows;
    return ((rows?.[0] as RowOf<TTable>) ?? null);
  }
}

// Lightweight in-memory repository used when a Drizzle table schema isn't provided
const memoryStore: Map<string, any[]> = new Map();
class MemoryRepository<T extends { id?: string }> implements Repository<T> {
  table: string;
  constructor(table: string) { this.table = table; }
  async initialize(): Promise<void> { return; }
  private getItems(): T[] { return memoryStore.get(this.table) as T[] ?? []; }
  private setItems(items: T[]): void { memoryStore.set(this.table, items as any[]); }
  private matchWhere(item: T, where?: Where<T>): boolean {
    if (!where) return true;
    return Object.entries(where).every(([k, v]) => (item as any)[k] === v);
  }
  async findOne({ where }: { where: Where<T> }): Promise<T | null> {
    const items = this.getItems();
    return items.find(i => this.matchWhere(i, where)) ?? null;
  }
  async findMany({ where }: { where?: Where<T> }): Promise<T[]> {
    const items = this.getItems();
    return items.filter(i => this.matchWhere(i, where));
  }
  async create({ data }: { data: T | Omit<T, "id"> }): Promise<T> {
    const items = this.getItems();
    const item = data as T;
    items.push(item);
    this.setItems(items);
    return item;
  }
  async createMany({ data }: { data: (T | Omit<T, "id">)[] }): Promise<T[]> {
    const items = this.getItems();
    const arr = data as T[];
    items.push(...arr);
    this.setItems(items);
    return arr;
  }
  async update({ where, data }: { where: Where<T>; data: Partial<T> }): Promise<T | null> {
    const items = this.getItems();
    const idx = items.findIndex(i => this.matchWhere(i, where));
    if (idx === -1) return null;
    const next = { ...items[idx], ...data } as T;
    items[idx] = next;
    this.setItems(items);
    return next;
  }
  async delete({ where }: { where: Where<T> }): Promise<T | null> {
    const items = this.getItems();
    const idx = items.findIndex(i => this.matchWhere(i, where));
    if (idx === -1) return null;
    const [removed] = items.splice(idx, 1);
    this.setItems(items);
    return removed ?? null;
  }
}

export class DrizzleDatabase {
  async initialize(): Promise<void> { return; }
  repo<T extends { id: string }, TTable extends AnyPgTable>(schema: TTable, tableName?: string): Repository<T> {
    const maybeTable = (schema as any)?._?.name as string | undefined;
    const table = tableName ?? maybeTable ?? String(schema ?? tableName ?? "");
    if (!maybeTable) {
      // Fallback to in-memory repository when a Drizzle table schema isn't provided (e.g., tests or simple modules)
      return new MemoryRepository(table) as unknown as Repository<T>;
    }
    return new DrizzleRepository(table as any, schema as any) as unknown as Repository<T>;
  }
}