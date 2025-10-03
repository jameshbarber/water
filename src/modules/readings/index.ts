import { ZodSchemaProvider } from "@/adapters/schema";
import { z } from "zod";

const readingsSchema = z.object({
    id: z.string(),
    value: z.number(),
    timestamp: z.string(),
});

const readingsSchemaProvider = new ZodSchemaProvider(readingsSchema);
export type ReadingRecord = z.infer<typeof readingsSchema>;
export { readingsSchemaProvider, readingsSchema };