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
            this.deps.rest?.start(this.manifest.interfaces.rest.port, this.manifest.interfaces.rest.host);
        }
        if (this.manifest.interfaces?.mcp?.enabled) {
            this.deps.mcp?.start();
        }

        // Seed DB settings only when using a DB-backed store (postgres/drizzle)
        try {
            const storeType = this.manifest.store?.type;
            if (storeType === "postgres" || storeType === "drizzle") {
                // Fire-and-forget seeding; ignore if table is missing
                this.deps.database?.repo?.("settings").create?.({
                    data: { id: "manifest", value: JSON.stringify(this.manifest) }
                } as any);
                this.deps.database?.repo?.("settings").create?.({
                    data: { id: "name", value: this.manifest.name }
                } as any);
            }
        } catch {
            // ignore if table doesn't exist or in tests
        }

        // Subscribe to in-memory manifest updates
        this.deps.eventBus.on("settings.manifest.updated", (next: any) => {
            try {
                if (next && typeof next === "object" && next.name && next.version) {
                    this.manifest = next;
                    this.deps.logger?.info?.(`Manifest updated to ${next.name}@${next.version}`);
                }
            } catch {}
        });
    }
}


export default App;

