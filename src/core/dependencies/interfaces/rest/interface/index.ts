import { AppInterface } from "../../types";
import { Deps } from "@/deps";
import { Route } from "../server/routes";
import { ServerAdapter } from "../server";

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