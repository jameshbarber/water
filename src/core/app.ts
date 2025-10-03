import { Deps } from "@/deps";
import fs from "fs";
import Module, { ModuleConfig, ModuleManifestConfig } from "./modules";

export interface ManifestModules {
    [key: string]: ModuleManifestConfig;
}

export interface AppModuleConfigs {
    [key: string]: ModuleConfig<any>;
}

interface InterfaceConfiguration {
    enabled: boolean;
}

interface RestInterfaceConfiguration {
    enabled: boolean;
    port: number;
    host: string;
}


export interface StoreConfiguration {
    type: "json" | "csv" | "drizzle" | "postgres";
    url: string;
}


export interface AppManifest {
    name: string;
    version: string;
    store?: StoreConfiguration;
    stores?: Record<string, { url: string; type: "json" | "csv" | "drizzle" | "postgres" }>;
    dependencies?: { db?: string; schema?: string; events?: string };
    interfaces: {
        mcp?: InterfaceConfiguration;
        rest?: RestInterfaceConfiguration;
    };
    modules: Record<string, any>;
}


class App {

    manifest: AppManifest;
    name: string;
    moduleConfigs: AppModuleConfigs = {};
    deps: Deps;

    constructor(manifest: AppManifest, deps: Deps) {
        this.name = manifest.name;
        this.deps = deps;
        this.manifest = manifest;
    }

    register<T extends { id: string }>(module: Module<T>) {
        const {name} = module;
        this.moduleConfigs[name] = module;
        if (this.manifest.interfaces?.rest?.enabled) {
            this.deps.rest?.register(module);
            // Mount any custom routes declared on the module
            if ((module as any).customRoutes?.length) {
                this.deps.rest?.createRoutes?.((module as any).customRoutes);
            }
        }
    }


    generateServerWelcome() {
        return `
        Welcome to ${this.manifest.name}
        URL: http://${this.manifest.interfaces.rest?.host}:${this.manifest.interfaces.rest?.port}
        `;
    }

    start() {
        if (this.manifest.interfaces?.rest?.enabled) {
            this.deps.rest?.mountSettingsApi?.();
            this.deps.rest?.start(this.manifest.interfaces.rest.port, this.manifest.interfaces.rest.host);
        }
        if (this.manifest.interfaces?.mcp?.enabled) {
            this.deps.mcp?.start();
        }

        try {
            this.deps.database?.repo?.("settings").create?.({
                data: {
                    id: "manifest",
                    value: JSON.stringify(this.manifest)
                },
            });
            this.deps.database?.repo?.("settings").create?.({
                data: {
                    id: "name",
                    value: this.manifest.name
                },
            });
        } catch {
            // ignore in tests without database
        }

        const pollMs = Number(process.env.SETTINGS_POLL_MS || 0);
        if (pollMs > 0) {
            const t = setInterval(() => {
                try {
                    const raw = fs.existsSync("db/settings.json") ? fs.readFileSync("db/settings.json", "utf8") : "{}";
                    const parsed = JSON.parse(raw || "{}");
                    const next = parsed?.manifest;
                    if (next && typeof next === "object" && next.name && next.version) {
                        this.manifest = next;
                    }
                } catch {
                    // swallow
                }
            }, pollMs);
            (t as any)?.unref?.();
        }
    }
}


export default App;

