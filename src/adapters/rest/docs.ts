import type { OpenAPI3, PathsObject } from "openapi-typescript";
import { DocumentGenerator, Route } from "@/core/dependencies/interfaces/rest";
import Module from "@/core/modules";
import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";

export class OpenAPIDocGenerator implements DocumentGenerator {
    private componentSchemas: Record<string, any> = {};
    private baseUrl: string;

    constructor(baseUrl: string = "/") {
        this.baseUrl = baseUrl;
    }

    registerModule(module: Module<any>) {
        const moduleSchemaProvider = module.schemas as any;
        const maybeFn = moduleSchemaProvider?.getSchema;
        const schema = typeof maybeFn === "function" ? maybeFn.call(moduleSchemaProvider) : undefined;

        const entity = (schema && typeof (schema as any).read === "object") ? schema : undefined;
        const candidate = (entity as any)?.read ?? (entity as any)?.create;
        const isZod = candidate && typeof (candidate as any)?._def?.typeName === "string";
        if (isZod) {
            const json: any = zodToJsonSchema(candidate as z.ZodTypeAny, module.name);
            const def = (json && (json as any).definitions && (json as any).definitions[module.name])
                || (json && (json as any).$defs && (json as any).$defs[module.name])
                || json;
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
            servers: [
                { url: this.baseUrl, description: "Local server", variables: { } }
            ],
            paths: routes.reduce((acc, r) => {
                const pathItem: any = acc[r.path] || {};
                const opId = `${r.method}_${r.path.replace(/\//g, "_").replace(/[{}:]/g, "").replace(/_{2,}/g, "_").replace(/^_+|_+$/g, "")}`;
                const moduleKey = r.path.split("/").filter(Boolean)[0];
                const operation: any = {
                    summary: r.summary,
                    description: r.description,
                    operationId: opId,
                    parameters: [],
                    responses: {
                        200: { description: "OK" },
                    },
                };

                // Parameters from inputSchemas.params and inputSchemas.query
                const params = (r as any).inputSchemas?.params ?? {};
                Object.keys(params).forEach((name) => {
                    operation.parameters.push({
                        name,
                        in: "path",
                        required: true,
                        schema: { type: "string" }
                    });
                });
                const query = (r as any).inputSchemas?.query;
                if (query) {
                    operation.parameters.push({
                        name: "query",
                        in: "query",
                        required: false,
                        schema: (moduleKey && this.componentSchemas[moduleKey]) ? this.componentSchemas[moduleKey] : { type: "object" }
                    });
                }

                // Request body
                const body = (r as any).inputSchemas?.body;
                if (body) {
                    operation.requestBody = {
                        required: true,
                        content: {
                            "application/json": {
                                schema: (moduleKey && this.componentSchemas[moduleKey]) ? this.componentSchemas[moduleKey] : { type: "object" }
                            }
                        }
                    }
                }

                pathItem[r.method] = operation;
                acc[r.path] = pathItem;
                return acc;
            }, {} as PathsObject),
            components: { schemas: { ...this.componentSchemas } },
        };
    }
}