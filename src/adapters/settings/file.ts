import fs from "fs";
import path from "path";

export class JsonSettingsStore {
    private filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
        this.ensureFile();
    }

    private ensureFile() {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(this.filePath)) fs.writeFileSync(this.filePath, JSON.stringify({}), "utf8");
    }

    private read(): any {
        const raw = fs.readFileSync(this.filePath, "utf8");
        try { return JSON.parse(raw || "{}"); } catch { return {}; }
    }

    private write(obj: any): void {
        fs.writeFileSync(this.filePath, JSON.stringify(obj, null, 2), "utf8");
    }

    getAll(): Record<string, any> {
        return this.read();
    }

    setAll(patch: Record<string, any>): Record<string, any> {
        const current = this.read();
        const next = { ...current, ...patch };
        this.write(next);
        return next;
    }

    get<T = any>(key: string): T | undefined {
        const current = this.read();
        return current[key];
    }

    set<T = any>(key: string, value: T): T {
        const current = this.read();
        current[key] = value;
        this.write(current);
        return value;
    }

    getManifest<T = any>(): T | undefined {
        return this.get<T>("manifest");
    }

    setManifest<T = any>(manifest: T): T {
        return this.set<T>("manifest", manifest);
    }
}


