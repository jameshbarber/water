import z from "zod"
import { Deps } from "@/deps";
import { DatabaseAdapter } from "./dependencies/db";

// Simple interface for module configs based on Zod schemas
export interface ModuleConfig {
    [key: string]: {
        schema: z.Schema;
        store: DatabaseAdapter<any>;
    };
}

// App manifest, contains the name, version, dependencies, and modules
export interface AppManifest {
    name: string;
    version: string;
    dependencies: {
        [key: string]: string;
    };
    modules: ModuleConfig;
}


// App class, contains the name, module configs, and deps
class App {

    name: string;
    moduleConfigs: ModuleConfig = {};
    deps: Deps;

    constructor(manifest: AppManifest, deps: Deps) {
        this.name = manifest.name;
        this.deps = deps;
    }

    register(name: string, schema: z.Schema, store: DatabaseAdapter<any>) {
        this.moduleConfigs[name] = { schema, store };
    }
}


export default App;

