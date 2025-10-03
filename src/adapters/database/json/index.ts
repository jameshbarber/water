// Database adapter interfaces and JSON-file-backed default implementation
import fs from "fs";
import path from "path";
import { Database, Repository, Where } from "@/core/dependencies/db";
import { randomUUID } from "crypto";
import { Logger } from "@/core/dependencies/logger";


type JsonStore<T> = { items: T[] };
type RootStore = Record<string, JsonStore<any>>;

export class JsonFileAdapter<T extends { id?: string }> implements Repository<T> {
    private filePath: string;
    private logger: Logger;
    table: string;

    constructor(filePath: string, logger: Logger, table: string) {
        this.filePath = filePath;
        this.logger = logger;
        this.ensureFile();
        this.table = table;
    }


    async initialize(): Promise<void> {
        return;
    }

    private ensureFile() {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify({}));
        }
    }

    private readRoot(): RootStore {
        const raw = fs.readFileSync(this.filePath, "utf8");
        try {
            const parsed = JSON.parse(raw || "{}");
            return (parsed && typeof parsed === "object") ? parsed : {};
        } catch {
            return {};
        }
    }

    private writeRoot(root: RootStore) {
        fs.writeFileSync(this.filePath, JSON.stringify(root));
    }

    private readTable(): JsonStore<T> {
        const root = this.readRoot();
        const existing = root[this.table] as JsonStore<T> | undefined;
        if (existing) return existing;
        const store = { items: [] } as JsonStore<T>;
        root[this.table] = store as any;
        this.writeRoot(root);
        return store;
    }

    private write(store: JsonStore<T>) {
        const root = this.readRoot();
        root[this.table] = store;
        this.writeRoot(root);
    }

    private matchWhere(item: T, where?: Where<T>): boolean {
        if (!where) return true;
        return Object.entries(where).every(([k, v]) => (item as any)[k] === v);
    }

    async findOne({ where }: { where: Where<T> }): Promise<T | null> {
        const { items } = this.readTable();
        return items.find(i => this.matchWhere(i, where)) ?? null;
    }

    async findMany({ where }: { where?: Where<T> }): Promise<T[]> {
        const { items } = this.readTable();
        return items.filter(i => this.matchWhere(i, where));
    }

    async create({ data }: { data: T | Omit<T, "id"> }): Promise<T> {
        const root = this.readRoot();
        const store = (root[this.table] ?? { items: [] }) as JsonStore<T>;
        const item = (data as T);
        if ((item as any).id === undefined || (item as any).id === null) {
            (item as any).id = randomUUID();
        }
        const idx = store.items.findIndex(i => (i as any).id === (item as any).id);
        if (idx >= 0) {
            store.items[idx] = item;
        } else {
            store.items.push(item);
        }
        root[this.table] = store as any;
        this.writeRoot(root);
        return item;
    }

    async createMany({ data }: { data: (T | Omit<T, "id">)[] }): Promise<T[]> {
        const root = this.readRoot();
        const store = (root[this.table] ?? { items: [] }) as JsonStore<T>;
        const out: T[] = [];
        for (const d of data) {
            const item = (d as T);
            if ((item as any).id === undefined || (item as any).id === null) {
                (item as any).id = randomUUID();
            }
            const idx = store.items.findIndex(i => (i as any).id === (item as any).id);
            if (idx >= 0) {
                store.items[idx] = item;
            } else {
                store.items.push(item);
            }
            out.push(item);
        }
        root[this.table] = store as any;
        this.writeRoot(root);
        return out;
    }

    async update({ where, data }: { where: Where<T>; data: Partial<T> }): Promise<T | null> {
        const root = this.readRoot();
        const store = (root[this.table] ?? { items: [] }) as JsonStore<T>;
        const idx = store.items.findIndex(i => this.matchWhere(i, where));
        if (idx === -1) return null;
        const updated = { ...store.items[idx], ...data } as T;
        store.items[idx] = updated;
        root[this.table] = store as any;
        this.writeRoot(root);
        return updated;
    }

    async delete({ where }: { where: Where<T> }): Promise<T | null> {
        const root = this.readRoot();
        const store = (root[this.table] ?? { items: [] }) as JsonStore<T>;
        const idx = store.items.findIndex(i => this.matchWhere(i, where));
        if (idx === -1) return null;
        const [removed] = store.items.splice(idx, 1);
        root[this.table] = store as any;
        this.writeRoot(root);
        return removed ?? null;
    }
}

export class JsonDatabase implements Database {
    private filePath: string;
    private logger: Logger;
    constructor(filePath: string, logger: Logger) {
        this.filePath = filePath;
        this.logger = logger;
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(this.filePath)) fs.writeFileSync(this.filePath, JSON.stringify({}));
    }
    async initialize(): Promise<void> { return; }
    repo<T extends { id?: string }>(source: any, tableName?: string): Repository<T> {
        const table = (typeof source === "object" && source && (source as any)._ && (source as any)._.name)
            ? (source as any)._.name
            : (tableName ?? String(source));
        return new JsonFileAdapter<T>(this.filePath, this.logger, table);
    }
}

