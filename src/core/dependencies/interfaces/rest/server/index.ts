import Module from "@/core/modules";
import { Route } from "./routes";

export interface ServerAdapter {
    register(module: Module<any>): void;
    createRoute(route: Route): void;
    createRoutes(routes: Route[]): void;
    getRoutes(): Route[];
    start(port?: number, host?: string): void;
    generateDocs(): any;
    serveDocs(): void;
    mountSettingsApi?(): void;
}
