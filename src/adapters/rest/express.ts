import { ServerAdapter } from "@/core/dependencies/interfaces";
import { RouteInterface } from "@/core/dependencies/interfaces/rest";
import { Deps } from "@/deps";
import express, { Express } from "express";

export class ExpressServerAdapter implements ServerAdapter {
    server?: Express;
    deps: Deps;
    port: number;
    host: string;

    constructor(deps: Deps, port: number, host: string) {
        this.deps = deps;
        this.port = port;
        this.host = host;
        this.server = express();
        this.server.use(express.json());
    }

    use(route: RouteInterface) {
        const { path, method, handler } = route;
        const app = this.server;
        if (!app) return;
        (app as any)[method](path, handler);
    }

    mountRoutes(routes: RouteInterface[]) {
        routes.forEach(r => {
            this.deps.logger?.info(`Mounting route ${r.path} ${r.method}`);
            this.use(r);
        });
    }

    start() {
        this.deps.logger?.info(`Starting API on ${this.host}:${this.port}`);
        this.server = this.server ?? express();
        this.deps.logger?.info(`Server: ${this.server}`);
        this.server.listen(this.port, this.host);
        this.deps.logger?.info(`API ready`);
    }

}       