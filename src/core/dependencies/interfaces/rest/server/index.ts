import Module from "@/core/modules";
import { Route } from "./routes";

export interface ServerAdapter {
    register(module: Module<any>): void;
    use(route: Route): void;
    mountRoutes(routes: Route[]): void;
    getRoutes(): Route[];
    start(): void;
}
