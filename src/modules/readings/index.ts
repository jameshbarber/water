import { ZodSchemaProvider } from "@/adapters/schema";
import { z } from "zod";

const readingsSchemaProvider = new ZodSchemaProvider();

const readingsSchema = z.object({
    id: z.string(),
    value: z.number(),
    timestamp: z.string(),
});

readingsSchemaProvider.create("readings", {
    create: readingsSchema,
    read: readingsSchema,
    query: readingsSchema,
});


export type ReadingRecord = z.infer<typeof readingsSchema>;
export { readingsSchemaProvider, readingsSchema };