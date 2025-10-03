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
            path: `/${module.name}/:id`,
            summary: `Get ${module.name}`,
            description: `Get a ${module.name}`,
            method: "get" as Method,
            handler: async (req: any, res: any) => {
                validateOrThrow(module.schemas.getSchema()?.read, req.params.id, `Invalid ${module.name} id`);
                const result = await module.findOne(req.params.id);
                return res.json(result);
            },
        },
        {
            summary: `List ${module.name}`,
            description: `List all ${module.name}`,
            path: `/${module.name}`,
            method: "get" as Method,
            handler: async (req: any, res: any) => {
                validateOrThrow(module.schemas.getSchema()?.query, req.query, `Invalid ${module.name} query`);
                const result = await module.findMany(req.query);
                return res.json(result);
            },
        },
        {
            path: `/${module.name}`,
            summary: `Create ${module.name}`,
            description: `Create a new ${module.name}`,
            method: "post" as Method,
            handler: async (req: any, res: any) => {
                validateOrThrow(module.schemas.getSchema()?.create, req.body, `Invalid ${module.name} body`);
                const result = await module.create(req.body);
                return res.json(result);
            },
        },
        {
            path: `/${module.name}`,
            summary: `Update ${module.name}`,
            description: `Update a ${module.name}`,
            method: "put" as Method,
            handler: async (req: any, res: any) => {
                validateOrThrow(module.schemas.getSchema()?.create, req.body, `Invalid ${module.name} body`);
                const result = await module.update(req.params.id, req.body);
                return res.json(result);
            },
        },
        {
            path: `/${module.name}`,
            summary: `Delete ${module.name}`,
            description: `Delete a ${module.name}`,
            method: "delete" as Method,
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