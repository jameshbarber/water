import { RouteInterface } from "./routes";

export interface ServerAdapter {
    use(route: RouteInterface): void;
    mountRoutes(routes: RouteInterface[]): void;
    start(): void;
}
