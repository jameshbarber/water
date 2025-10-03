import { Deps } from "@/deps";
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
        }
    }

    start() {
        if (this.manifest.interfaces?.rest?.enabled) {
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
                    value: JSON.stringify(this.manifest.name)
                },
            });
        } catch {
            // ignore in tests without database
        }
    }
}


export default App;

