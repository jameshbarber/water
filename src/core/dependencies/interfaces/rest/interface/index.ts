import { AppInterface } from "@/core/dependencies/interfaces/types";
import { Deps } from "@/deps";
import { Route, ServerAdapter } from "@/core/dependencies/interfaces/rest";

export class RestInterface extends AppInterface {
    server: ServerAdapter;    
    deps: Deps;

    constructor(name: string, version: string, server: ServerAdapter, deps: Deps) {
        super(name, version);
        this.server = server;
        this.deps = deps;
    }

    registerRoute(route: Route) {
        this.server.createRoute(route);
    }

    initialize() {
        this.server.start()
    }
}