import { Database, Repository, Where } from "@/core/dependencies/db";
import { Pool } from "pg";

export class PgRepository<T extends { id?: string }> implements Repository<T> {
    table: string;
    private pool: Pool;

    constructor(pool: Pool, table: string) {
        this.pool = pool;
        this.table = table;
    }

    async initialize(): Promise<void> { return; }

    private buildWhere(where?: Where<T>) {
        if (!where) return { sql: "", params: [] as unknown[] };
        const keys = Object.keys(where);
        const clauses = keys.map((k, i) => `"${k}" = $${i + 1}`);
        const params = keys.map(k => (where as any)[k]);
        return { sql: clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "", params };
    }

    async findOne({ where }: { where: Where<T> }): Promise<T | null> {
        const { sql, params } = this.buildWhere(where);
        const q = `SELECT * FROM "${this.table}"${sql} LIMIT 1`;
        const { rows } = await this.pool.query(q, params);
        return (rows[0] ?? null) as T | null;
    }

    async findMany({ where }: { where?: Where<T> }): Promise<T[]> {
        const { sql, params } = this.buildWhere(where);
        const q = `SELECT * FROM "${this.table}"${sql}`;
        const { rows } = await this.pool.query(q, params);
        return rows as T[];
    }

    async create({ data }: { data: T | Omit<T, "id"> }): Promise<T> {
        const entries = Object.entries(data as Record<string, unknown>);
        const cols = entries.map(([k]) => `"${k}"`).join(", ");
        const vals = entries.map((_, i) => `$${i + 1}`).join(", ");
        const params = entries.map(([, v]) => v);
        const q = `INSERT INTO "${this.table}" (${cols}) VALUES (${vals}) RETURNING *`;
        const { rows } = await this.pool.query(q, params);
        return rows[0] as T;
    }

    async update({ where, data }: { where: Where<T>; data: Partial<T> }): Promise<T | null> {
        const setEntries = Object.entries(data as Record<string, unknown>);
        if (setEntries.length === 0) return this.findOne({ where });
        const setSql = setEntries.map(([k], i) => `"${k}" = $${i + 1}`).join(", ");
        const setParams = setEntries.map(([, v]) => v);
        const { sql: whereSql, params: whereParams } = this.buildWhere(where);
        const q = `UPDATE "${this.table}" SET ${setSql}${whereSql} RETURNING *`;
        const { rows } = await this.pool.query(q, [...setParams, ...whereParams]);
        return (rows[0] ?? null) as T | null;
    }

    async delete({ where }: { where: Where<T> }): Promise<T | null> {
        const { sql, params } = this.buildWhere(where);
        const q = `DELETE FROM "${this.table}"${sql} RETURNING *`;
        const { rows } = await this.pool.query(q, params);
        return (rows[0] ?? null) as T | null;
    }
}

export class PostgresDatabase implements Database {
    private pool: Pool;

    constructor(connectionString: string) {
        this.pool = new Pool({ connectionString });
    }

    async initialize(): Promise<void> { return; }

    repo<T extends { id?: string }>(source: any, tableName?: string): Repository<T> {
        const table = (source && (source as any)._.name) || tableName || String(source);
        return new PgRepository<T>(this.pool, table);
    }
}


