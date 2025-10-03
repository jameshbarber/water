import { ServerAdapter, Route, DocumentGenerator } from "@/core/dependencies/interfaces";
import Module from "@/core/modules";
import { Deps } from "@/deps";
import express, { Express } from "express";
import { createCrudRoutes } from "./router";
import AppError from "@/core/error";


export class ExpressServerAdapter implements ServerAdapter {
    server?: Express;
    deps: Deps;
    private routes: Route[] = [];
    private docs?: DocumentGenerator;

    constructor(deps: Deps) {
        this.deps = deps;
        this.server = express();
        this.server.use(express.json());
        this.docs = deps.docs;
    }

    register(module: Module<any>) {
        const moduleSchemaProvider = module.schemas;
        const schema = moduleSchemaProvider?.getSchema?.(module.name);
        this.deps.logger?.info(`Registering module ${module.name} with schemas ${JSON.stringify(schema)}`);
        this.docs?.registerModule(module);
        this.createRoutes(createCrudRoutes(module));
    }

    createRoute(route: Route) {
        const { path, method, handler } = route;
        const app = this.server;
        if (!app) return;
        (app as any)[method](path, async (req: any, res: any) => {
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

    start(port?: number, host?: string) {
        this.deps.logger?.info(`Starting API`);
        this.server = this.server ?? express();
        this.deps.logger?.info(`Server: ${this.server}`);
        this.server.listen(port ?? 3000, host ?? "0.0.0.0");
        this.deps.logger?.info(`API ready`);
    }
}       