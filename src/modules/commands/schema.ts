import { ZodSchemaProvider } from "@/adapters/schema";
import { z } from "zod";

const schema = new ZodSchemaProvider();

const commandSchema = z.object({
    id: z.string(),
    command: z.string(),
});

schema.create("commands", { 
    create: commandSchema,
    read: commandSchema,
    query: commandSchema.partial(),
});

export type CommandRecord = z.infer<typeof commandSchema>;
export default schema;