import type { OpenAPI3 } from "openapi-typescript";
import type { RouteInterface } from "../index";

class DocumentGenerator {
    name: string;
    version: string;

    constructor(name: string, version: string) {
        this.name = name;
        this.version = version;
    }

    generate(routes: RouteInterface[]): OpenAPI3 {
        const pathsObject: OpenAPI3["paths"] = routes.reduce((acc, route) => {
            if (!acc) {
                acc = {} as OpenAPI3["paths"];
            }
            acc[route.path as keyof OpenAPI3["paths"]] = this.handlePath(route);
            return acc;
        }, {} as OpenAPI3["paths"]);

        return {
            openapi: "3.0.0",
            info: {
                title: this.name,
                version: this.version,
            },
            paths: pathsObject,
        } as OpenAPI3
    }

    handlePath(route: RouteInterface): OpenAPI3["paths"][keyof OpenAPI3["paths"]] {
        const operation: OpenAPI3["paths"] = {
            summary: route.summary,
            description: route.description,
            responses: {
                "200": { description: "Success" } as OpenAPI3["paths"][keyof OpenAPI3["paths"]]["responses"],
            },
        };

        return {
            [route.method]: operation,
        } as OpenAPI3["paths"][keyof OpenAPI3["paths"]];
    }
}


export { DocumentGenerator };