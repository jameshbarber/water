// Database adapter interfaces and JSON-file-backed default implementation
import fs from "fs";
import path from "path";
import { Database, Repository, Where } from "@/core/dependencies/db";
import { randomUUID } from "crypto";
import { Logger } from "@/core/dependencies/logger";

export class CsvFileAdapter<T extends { id?: string }> implements Repository<T> {
    private filePath: string;
    private headers: string[];
    private logger: Logger;
    table: string;

    constructor(filePath: string, logger: Logger, table: string, headers?: (keyof T)[]) {
        this.filePath = filePath;
        this.logger = logger;
        this.table = table;
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        if (fs.existsSync(this.filePath)) {
            const first = fs.readFileSync(this.filePath, "utf8").split(/\r?\n/)[0] || "";
            this.headers = first ? first.split(",").map(h => h.trim()) : (headers?.map(String) ?? ["id"]);
            if (!first) {
                fs.writeFileSync(this.filePath, this.headers.join(",") + "\n");
            }
        } else {
            this.headers = headers?.map(String) ?? ["id"];
            fs.writeFileSync(this.filePath, this.headers.join(",") + "\n");
        }
    }

    async initialize(): Promise<void> {
        return;
    }

    private readAll(): T[] {
        const raw = fs.readFileSync(this.filePath, "utf8");
        const lines = raw.split(/\r?\n/).filter(Boolean);
        if (lines.length <= 1) return [];
        const headers = (lines[0] || "").split(",").map(h => h.trim());
        return lines.slice(1).map(line => {
            const cols = line.split(",");
            const obj: any = {};
            headers.forEach((h, i) => {
                obj[h] = (cols[i] ?? "").trim();
            });
            return obj as T;
        });
    }

    private writeAll(items: T[]) {
        const headers = this.headers;
        const rows = items.map((item: any) => headers.map(h => String(item[h] ?? "")));
        const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n") + "\n";
        fs.writeFileSync(this.filePath, csv);
    }

    private matchWhere(item: T, where?: Where<T>): boolean {
        if (!where) return true;
        return Object.entries(where).every(([k, v]) => (item as any)[k] === v);
    }

    async findOne({ where }: { where: Where<T> }): Promise<T | null> {
        const items = this.readAll();
        return items.find(i => this.matchWhere(i, where)) ?? null;
    }

    async findMany({ where }: { where?: Where<T> }): Promise<T[]> {
        const items = this.readAll();
        return items.filter(i => this.matchWhere(i, where));
    }

    async create({ data }: { data: T | Omit<T, "id"> }): Promise<T> {
        const items = this.readAll();
        const item = (data as any);
        if (item.id === undefined || item.id === null) {
            item.id = randomUUID();
        } else {
            item.id = String(item.id);
        }
        items.push(item);
        this.writeAll(items);
        return item as T;
    }

    async createMany({ data }: { data: (T | Omit<T, "id">)[] }): Promise<T[]> {
        const items = this.readAll();
        const out: T[] = [];
        for (const d of data) {
            const item = (d as any);
            if (item.id === undefined || item.id === null) {
                item.id = randomUUID();
            } else {
                item.id = String(item.id);
            }
            items.push(item);
            out.push(item as T);
        }
        this.writeAll(items);
        return out;
    }

    async update({ where, data }: { where: Where<T>; data: Partial<T> }): Promise<T | null> {
        const items = this.readAll();
        const idx = items.findIndex(i => this.matchWhere(i, where));
        if (idx === -1) return null;
        const updated = { ...(items[idx] as any), ...(data as any) } as any;
        if (updated.id !== undefined && updated.id !== null) {
            updated.id = String(updated.id);
        }
        items[idx] = updated;
        this.writeAll(items);
        return updated as T;
    }

    async delete({ where }: { where: Where<T> }): Promise<T | null> {
        const items = this.readAll();
        const idx = items.findIndex(i => this.matchWhere(i, where));
        if (idx === -1) return null;
        const [removed] = items.splice(idx, 1);
        this.writeAll(items);
        return removed ?? null;
    }
}

export class CsvDatabase implements Database {
    private dir: string;
    private logger: Logger;
    constructor(dir: string, logger: Logger) {
        this.dir = dir;
        this.logger = logger;
    }
    async initialize(): Promise<void> { return; }
    repo<T extends { id?: string }>(tableName: string): Repository<T> {
        const filePath = path.join(this.dir, `${tableName}.csv`);
        return new CsvFileAdapter<T>(filePath, this.logger, tableName);
    }
}