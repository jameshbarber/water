import z from "zod"
import { Deps } from "@/deps";
import { DatabaseAdapter } from "./dependencies/db";
import Module from "./modules/module";

// Declarative manifest modules (human-friendly strings)
export interface ManifestModules {
    [key: string]: {
        schema: string;
        store: string;
    };
}

// Resolved app module configs (actual instances)
export interface AppModuleConfigs {
    [key: string]: {
        name: string;
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
    modules: ManifestModules;
}


// App class, contains the name, module configs, and deps
class App {

    name: string;
    moduleConfigs: AppModuleConfigs = {};
    deps: Deps;

    constructor(manifest: AppManifest, deps: Deps) {
        this.name = manifest.name;
        this.deps = deps;
    }

    register<T extends { id: string }>(module: Module<T>) {
        const {name, schema, store} = module;
        if (!schema.getSchema(name)?.read) {
            throw new Error(`Schema for ${name} is not defined`);
        }
        this.moduleConfigs[name] = { schema: schema.getSchema(name)?.read as z.Schema, store, name };
        // auto-register basic CRUD using the Store; Schema can be used for validation later
        this.deps.rest?.use({
            path: `/${name}`,
            summary: `List ${name}`,
            description: `List all ${name}`,
            method: "get",
            handler: async (_req: any, res: any) => {
                const items = await this.moduleConfigs[name].store.findMany({});
                return res.json(items);
            }
        });
        this.deps.rest?.use({
            path: `/${name}/:id`,
            summary: `Get ${name} by id`,
            description: `Get a single ${name}`,
            method: "get",
            handler: async (req: any, res: any) => {
                const out = await this.moduleConfigs[name].store.findOne({ where: { id: req.params.id } as any });
                return res.json(out);
            }
        });
        this.deps.rest?.use({
            path: `/${name}`,
            summary: `Create ${name}`,
            description: `Create a ${name}`,
            method: "post",
            handler: async (req: any, res: any) => {
                const out = await this.moduleConfigs[name].store.create({ data: req.body });
                return res.status(201).json(out);
            }
        });
        this.deps.rest?.use({
            path: `/${name}/:id`,
            summary: `Update ${name}`,
            description: `Update a ${name}`,
            method: "put",
            handler: async (req: any, res: any) => {
                const out = await this.moduleConfigs[name].store.update({ where: { id: req.params.id } as any, data: req.body });
                return res.json(out);
            }
        });
        this.deps.rest?.use({
            path: `/${name}/:id`,
            summary: `Delete ${name}`,
            description: `Delete a ${name}`,
            method: "delete",
            handler: async (req: any, res: any) => {
                const out = await this.moduleConfigs[name].store.delete({ where: { id: req.params.id } as any });
                return res.json(out);
            }
        });
    }

    start() {
        this.deps.rest?.start();
        this.deps.mcp?.start();
    }
}


export default App;

