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

export class DrizzleDatabase {
  async initialize(): Promise<void> { return; }
  repo<T extends { id: string }, TTable extends AnyPgTable>(schema: TTable, tableName?: string): Repository<T> {
    return new DrizzleRepository(tableName ?? (schema as any)._.name as string, schema) as unknown as Repository<T>;
  }
}