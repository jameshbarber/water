import { ServerAdapter } from "@/core/dependencies/interfaces";
import { Route } from "@/core/dependencies/interfaces/rest";
import Module from "@/core/modules";
import { Deps } from "@/deps";
import express, { Express } from "express";
import { createCrudRoutes } from "./router";

export class ExpressServerAdapter implements ServerAdapter {
    server?: Express;
    deps: Deps;
    port: number;
    host: string;
    private routes: Route[] = [];

    constructor(deps: Deps, port: number, host: string) {
        this.deps = deps;
        this.port = port;
        this.host = host;
        this.server = express();
        this.server.use(express.json());
    }

    register(module: Module<any>) {
        const moduleSchemaProvider = module.schema
        const schema = moduleSchemaProvider.getSchema(module.name)
        this.deps.logger?.info(`Registering module ${module.name} with schemas ${JSON.stringify(schema)}`);
        const routes = createCrudRoutes(module);
        routes.forEach(r => this.use(r));
    }

    use(route: Route) {
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

    mountRoutes(routes: Route[]) {
        routes.forEach(r => {
            this.deps.logger?.info(`Mounting route ${r.path} ${r.method}`);
            this.use(r);
        });
    }

    getRoutes(): Route[] {
        return [...this.routes];
    }

    start() {
        this.deps.logger?.info(`Starting API on ${this.host}:${this.port}`);
        this.server = this.server ?? express();
        this.deps.logger?.info(`Server: ${this.server}`);
        this.server.listen(this.port, this.host);
        this.deps.logger?.info(`API ready`);
    }

}       