import { ServerAdapter } from "@/core/dependencies/interfaces";
import { Route } from "@/core/dependencies/interfaces/rest";
import Module from "@/core/modules";
import { Deps } from "@/deps";
import express, { Express } from "express";
import { createCrudRoutes } from "./router";
import { OpenAPI3, PathsObject } from "openapi-typescript";

export class ExpressServerAdapter implements ServerAdapter {
    server?: Express;
    deps: Deps;
    private routes: Route[] = [];

    constructor(deps: Deps) {
        this.deps = deps;
        this.server = express();
        this.server.use(express.json());
    }

    register(module: Module<any>) {
        const moduleSchemaProvider = module.schemas;
        const schema = moduleSchemaProvider?.getSchema?.();
        this.deps.logger?.info(`Registering module ${module.name} with schemas ${JSON.stringify(schema)}`);
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

    getOpenAPISchema(): OpenAPI3 {
        return {
            openapi: "3.0.0",
            info: {
                title: "API",
                version: "1.0.0"
            },
            paths: this.routes.reduce((acc, r) => {
                const pathItem: any = acc[r.path] || {};
                pathItem[r.method] = {
                    summary: r.summary,
                    description: r.description,
                    responses: {
                        200: { description: "OK" }
                    }
                };
                acc[r.path] = pathItem;
                return acc;
            }, {} as PathsObject),
            components: { schemas: {} }
        };
    }

    start(port?: number, host?: string) {
        this.deps.logger?.info(`Starting API`);
        this.server = this.server ?? express();
        this.deps.logger?.info(`Server: ${this.server}`);
        this.server.listen(port ?? 3000, host ?? "0.0.0.0");
        this.deps.logger?.info(`API ready`);
    }
}       