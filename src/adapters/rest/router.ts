import { Route } from "@/core/dependencies/interfaces/rest";
import Module from "@/core/modules";
import { Method } from "openapi-typescript";
import { z } from "zod";
import AppError from "@/core/error";

const validateOrThrow = (schema: z.ZodType<any> | undefined, data: unknown, message: string): void => {
    if (!schema) return;
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new AppError(message, 422, "validation_error", result.error.issues);
    }
}

const createCrudRoutes = (module: Module<any>): Route[] => {

    const routes = [
        {
            path: `/${module.name}/{id}`,
            summary: `Get ${module.name}`,
            description: `Get a ${module.name}`,
            method: "get" as Method,
            inputSchemas: {
                params: { id: z.string() }
            },
            handler: async (req: any, res: any) => {
                const prov: any = module.schemas as any;
                const entity = typeof prov?.getSchema === "function" ? prov.getSchema() : prov;
                validateOrThrow(entity?.read, req.params.id, `Invalid ${module.name} id`);
                const result = await module.findOne(req.params.id);
                return res.json(result);
            },
        },
        {
            summary: `List ${module.name}`,
            description: `List all ${module.name}`,
            path: `/${module.name}`,
            method: "get" as Method,
            inputSchemas: (() => {
                const prov: any = module.schemas as any;
                const entity = typeof prov?.getSchema === "function" ? prov.getSchema() : prov;
                return { query: entity?.query as any };
            })(),
            handler: async (req: any, res: any) => {
                const prov: any = module.schemas as any;
                const entity = typeof prov?.getSchema === "function" ? prov.getSchema() : prov;
                validateOrThrow(entity?.query, req.query, `Invalid ${module.name} query`);
                const result = await module.findMany(req.query);
                return res.json(result);
            },
        },
        {
            path: `/${module.name}`,
            summary: `Create ${module.name}`,
            description: `Create a new ${module.name}`,
            method: "post" as Method,
            inputSchemas: (() => {
                const prov: any = module.schemas as any;
                const entity = typeof prov?.getSchema === "function" ? prov.getSchema() : prov;
                return { body: entity?.create as any };
            })(),
            handler: async (req: any, res: any) => {
                const prov: any = module.schemas as any;
                const entity = typeof prov?.getSchema === "function" ? prov.getSchema() : prov;
                validateOrThrow(entity?.create, req.body, `Invalid ${module.name} body`);
                const result = await module.create(req.body);
                return res.json(result);
            },
        },
        {
            path: `/${module.name}/{id}`,
            summary: `Update ${module.name}`,
            description: `Update a ${module.name}`,
            method: "put" as Method,
            inputSchemas: (() => {
                const prov: any = module.schemas as any;
                const entity = typeof prov?.getSchema === "function" ? prov.getSchema() : prov;
                return { params: { id: z.string() }, body: entity?.create as any };
            })(),
            handler: async (req: any, res: any) => {
                const prov: any = module.schemas as any;
                const entity = typeof prov?.getSchema === "function" ? prov.getSchema() : prov;
                validateOrThrow(entity?.create, req.body, `Invalid ${module.name} body`);
                const result = await module.update(req.params.id, req.body);
                return res.json(result);
            },
        },
        {
            path: `/${module.name}/{id}`,
            summary: `Delete ${module.name}`,
            description: `Delete a ${module.name}`,
            method: "delete" as Method,
            inputSchemas: {
                params: { id: z.string() }
            },
            handler: async (req: any, res: any) => {
                validateOrThrow(undefined, req.body, `Invalid ${module.name} body`);
                const result = await module.delete(req.params.id);
                return res.json(result);
            },
        },
    ]

    return routes;
}

export { createCrudRoutes };