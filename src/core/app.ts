import z from "zod"
import { Deps } from "@/deps";
import { DatabaseAdapter } from "./dependencies/db";
import Module from "./modules";

export interface ManifestModules {
    [key: string]: {
        schema: string;
        store: string;
    };
}

export interface AppModuleConfigs {
    [key: string]: {
        name: string;
        schema: z.Schema;
        store: DatabaseAdapter<any>;
    };
}

interface InterfaceConfiguration {
    enabled: boolean;
}

interface RestInterfaceConfiguration {
    enabled: boolean;
    port: number;
    host: string;
}


export interface AppManifest {
    name: string;
    version: string;
    interfaces: {
        mcp?: InterfaceConfiguration;
        rest?: RestInterfaceConfiguration;
    };
    dependencies: {
        [key: string]: string;
    };
    modules: ManifestModules;
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
        const {name, schema, store} = module;
        if (!schema.getSchema(name)?.read) {
            throw new Error(`Schema for ${name} is not defined`);
        }
        this.moduleConfigs[name] = { schema: schema.getSchema(name)?.read as z.Schema, store, name };
        if (this.manifest.interfaces?.rest) {
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
    }
}


export default App;

