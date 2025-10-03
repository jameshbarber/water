import { ZodSchemaProvider } from "@/adapters/schema";
import { z } from "zod";

const commandSchema = z.object({
    id: z.string(),
    command: z.string(),
});

const commandSchemaProvider = new ZodSchemaProvider(commandSchema);

export type CommandRecord = z.infer<typeof commandSchema>;
export { commandSchemaProvider, commandSchema };