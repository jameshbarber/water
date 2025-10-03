// Database adapter interfaces and JSON-file-backed default implementation
import fs from "fs";
import path from "path";
import { Database, Store, Where } from "@/core/dependencies/db";
import { randomUUID } from "crypto";
import { Logger } from "@/core/dependencies/logger";


type JsonStore<T> = { items: T[] };

export class JsonFileAdapter<T extends { id?: string }> implements Store<T> {
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
        if ((item as any).id === undefined || (item as any).id === null) {
            (item as any).id = randomUUID();
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

export class JsonDatabase implements Database {
    private filePath: string;
    private logger: Logger;
    constructor(filePath: string, logger: Logger) {
        this.filePath = filePath;
        this.logger = logger;
    }
    async initialize(): Promise<void> { return; }
    repo<T extends { id?: string }>(tableName: string): Store<T> {
        return new JsonFileAdapter<T>(this.filePath, this.logger, tableName);
    }
}

