import { ZodSchemaProvider } from "@/adapters/schema";
import { z } from "zod";

const schema = new ZodSchemaProvider();

const readings = schema.create("readings", {
    create: z.object({
        id: z.string(),
        value: z.number(),
        timestamp: z.string(),
    }),
    read: z.object({
        id: z.string(),
        value: z.number(),
        timestamp: z.string(),
    }),
    query: z.object({
        id: z.string(),
        value: z.number(),
        timestamp: z.string(),
    }),
});

export default readings;