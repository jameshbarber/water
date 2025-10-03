import type { OpenAPI3, PathsObject } from "openapi-typescript";
import { DocumentGenerator, Route } from "@/core/dependencies/interfaces/rest";
import Module from "@/core/modules";
import { zodToJsonSchema } from "zod-to-json-schema";

export class OpenAPIDocGenerator implements DocumentGenerator {
    private componentSchemas: Record<string, any> = {};

    registerModule(module: Module<any>) {
        const moduleSchemaProvider = module.schemas;
        const schema = moduleSchemaProvider?.getSchema?.(module.name);

        const zodSchema = (schema as any)?.read ?? (schema as any)?.create;
        if (zodSchema) {
            const json: any = zodToJsonSchema(zodSchema, module.name);
            const def = json?.definitions?.[module.name] ?? json;
            this.componentSchemas[module.name] = def ?? {};
        }
    }

    generate(routes: Route[]): OpenAPI3 {
        return {
            openapi: "3.0.0",
            info: {
                title: "API",
                version: "1.0.0",
            },
            paths: routes.reduce((acc, r) => {
                const pathItem: any = acc[r.path] || {};
                pathItem[r.method] = {
                    summary: r.summary,
                    description: r.description,
                    responses: {
                        200: { description: "OK" },
                    },
                };
                acc[r.path] = pathItem;
                return acc;
            }, {} as PathsObject),
            components: { schemas: { ...this.componentSchemas } },
        };
    }
}