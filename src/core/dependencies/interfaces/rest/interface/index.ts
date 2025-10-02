import { AppInterface } from "../../types";
import { Deps } from "@/deps";
import { RouteInterface } from "../server/routes";
import { ServerAdapter } from "../server";

export class RestInterface extends AppInterface {
    server: ServerAdapter;    
    deps: Deps;

    constructor(name: string, version: string, server: ServerAdapter, deps: Deps) {
        super(name, version);
        this.server = server;
        this.deps = deps;
    }

    registerRoute(route: RouteInterface) {
        this.server.use(route);
    }

    initialize() {
        this.server.start()
    }
}