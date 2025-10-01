// Database adapter interfaces and JSON-file-backed default implementation
import fs from "fs";
import path from "path";

export type Where<T> = Partial<Record<keyof T, any>>;

export interface DatabaseAdapter<T> {
    findOne(args: { where: Where<T> }): Promise<T | null>;
    findMany(args: { where?: Where<T> }): Promise<T[]>;
    create(args: { data: T | Omit<T, "id"> }): Promise<T>;
    update(args: { where: Where<T>; data: Partial<T> }): Promise<T | null>;
    delete(args: { where: Where<T> }): Promise<T | null>;
}

type JsonStore<T> = { items: T[] };

export class JsonFileAdapter<T extends { id: string | number }> implements DatabaseAdapter<T> {
    private filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
        this.ensureFile();
    }

    private ensureFile() {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify({ items: [] }));
        }
    }

    private read(): JsonStore<T> {
        const raw = fs.readFileSync(this.filePath, "utf8");
        return JSON.parse(raw || "{\"items\":[]}");
    }

    private write(store: JsonStore<T>) {
        fs.writeFileSync(this.filePath, JSON.stringify(store));
    }

    private matchWhere(item: T, where?: Where<T>): boolean {
        if (!where) return true;
        return Object.entries(where).every(([k, v]) => (item as any)[k] === v);
    }

    async findOne({ where }: { where: Where<T> }): Promise<T | null> {
        const { items } = this.read();
        return items.find(i => this.matchWhere(i, where)) ?? null;
    }

    async findMany({ where }: { where?: Where<T> }): Promise<T[]> {
        const { items } = this.read();
        return items.filter(i => this.matchWhere(i, where));
    }

    async create({ data }: { data: T | Omit<T, "id"> }): Promise<T> {
        const store = this.read();
        const item = (data as T);
        // If id missing, auto-assign numeric increasing id
        if ((item as any).id === undefined || (item as any).id === null) {
            const maxId = store.items.reduce((m, i: any) => Math.max(m, Number(i.id) || 0), 0);
            (item as any).id = maxId + 1;
        }
        store.items.push(item);
        this.write(store);
        return item;
    }

    async update({ where, data }: { where: Where<T>; data: Partial<T> }): Promise<T | null> {
        const store = this.read();
        const idx = store.items.findIndex(i => this.matchWhere(i, where));
        if (idx === -1) return null;
        const updated = { ...store.items[idx], ...data } as T;
        store.items[idx] = updated;
        this.write(store);
        return updated;
    }

    async delete({ where }: { where: Where<T> }): Promise<T | null> {
        const store = this.read();
        const idx = store.items.findIndex(i => this.matchWhere(i, where));
        if (idx === -1) return null;
        const [removed] = store.items.splice(idx, 1);
        this.write(store);
        return removed ?? null;
    }
}

export class CsvFileAdapter<T extends { id: string | number }> implements DatabaseAdapter<T> {
    private filePath: string;
    private headers: string[];

    constructor(filePath: string, headers?: (keyof T)[]) {
        this.filePath = filePath;
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
            const maxId = items.reduce((m, i: any) => Math.max(m, Number(i.id) || 0), 0);
            item.id = maxId + 1;
        }
        items.push(item);
        this.writeAll(items);
        return item as T;
    }

    async update({ where, data }: { where: Where<T>; data: Partial<T> }): Promise<T | null> {
        const items = this.readAll();
        const idx = items.findIndex(i => this.matchWhere(i, where));
        if (idx === -1) return null;
        const updated = { ...(items[idx] as any), ...(data as any) } as T;
        items[idx] = updated;
        this.writeAll(items);
        return updated;
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