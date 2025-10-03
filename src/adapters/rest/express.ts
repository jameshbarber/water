import { ServerAdapter, Route, DocumentGenerator } from "@/core/dependencies/interfaces";
import Module from "@/core/modules";
import { Deps } from "@/deps";
import express, { Express } from "express";
import { createCrudRoutes } from "./router";
import AppError from "@/core/error";
import { JsonSettingsStore } from "@/adapters/settings/file";


export class ExpressServerAdapter implements ServerAdapter {
    server?: Express;
    deps: Deps;
    private routes: Route[] = [];
    private docs?: DocumentGenerator;
    private settings?: JsonSettingsStore;

    constructor(deps: Deps) {
        this.deps = deps;
        this.server = express();
        this.server.use(express.json());
        // Wildcard CORS for now
        this.server.use((req: any, res: any, next: any) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers") || "*");
            if (req.method === "OPTIONS") return res.sendStatus(204);
            next();
        });
        this.docs = deps.docs;
        this.settings = new JsonSettingsStore("db/settings.json");
    }

    register(module: Module<any>) {
        const moduleSchemaProvider = module.schemas as any;
        const maybeFn = moduleSchemaProvider?.getSchema;
        const schema = typeof maybeFn === "function" ? maybeFn.call(moduleSchemaProvider) : undefined;
        this.deps.logger?.info(`Registering module ${module.name} with schemas ${JSON.stringify(schema)}`);
        this.docs?.registerModule(module);
        this.createRoutes(createCrudRoutes(module));
    }

    createRoute(route: Route) {
        const { path, method, handler } = route;
        const app = this.server;
        if (!app) return;
        const expressPath = path.replace(/\{(\w+)\}/g, ":$1");
        (app as any)[method](expressPath, async (req: any, res: any) => {
            try {
                await handler(req, res);
            } catch (err: any) {
                const status = err?.status ?? 500;
                const code = err?.code ?? "internal_error";
                const message = err?.message ?? "Internal Server Error";
                const details = err?.details;
                this.deps.logger?.error?.(`[REST] ${method.toUpperCase()} ${path} -> ${status} ${code}: ${message}`);
                res.status(status).json({ code, message, details });
            }
        });
        this.routes.push(route);
        // TODO: Add OpenAPI documentation generation
    }

    createRoutes(routes: Route[]) {
        routes.forEach(r => {
            this.deps.logger?.info(`Mounting route ${r.path} ${r.method}`);
            this.createRoute(r);
        });
    }

    getRoutes(): Route[] {
        return [...this.routes];
    }

    generateDocs(): any {
        if (!this.docs) throw new AppError("Docs not found");
        return this.docs?.generate(this.routes);
    }

    serveDocs() {
        this.server?.get("/docs/rest", (req: any, res: any) => {
            const schema = this.docs?.generate(this.routes);
            if (!schema) throw new AppError("Docs not found");
            res.json(schema);
        });
    }

    // Lightweight settings + manifest endpoints
    mountSettingsApi() {
        const app = this.server;
        if (!app) return;
        app.get("/settings", (_req: any, res: any) => {
            res.json(this.settings?.getAll() ?? {});
        });
        app.put("/settings", (req: any, res: any) => {
            const next = this.settings?.setAll(req.body ?? {});
            res.json(next ?? {});
        });
        app.get("/manifest", (_req: any, res: any) => {
            res.json(this.settings?.getManifest() ?? {});
        });
        app.put("/manifest", (req: any, res: any) => {
            const next = this.settings?.setManifest(req.body ?? {});
            res.json(next ?? {});
        });
    }

    start(port?: number, host?: string) {
        this.deps.logger?.info(`Starting API`);
        this.server = this.server ?? express();
        this.deps.logger?.info(`Server: ${this.server}`);
        this.server.listen(port ?? 3000, host ?? "0.0.0.0");
        this.deps.logger?.info(`API ready`);
    }
}       