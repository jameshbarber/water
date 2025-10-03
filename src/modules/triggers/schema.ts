import { ZodSchemaProvider } from "@/adapters/schema";
import { z } from "zod";

const triggerSchema = z.object({
    id: z.string(),
    name: z.string(),
    event: z.string(),
    type: z.enum(["cron", "value"]),
    cron: z.string().optional(),
    value: z.string().optional(),
    operation: z.enum([">", "<", "==", "!=", ">=", "<="]),
    deviceId: z.string(),
    commandId: z.string(),
}).superRefine((data, ctx) => {
    if (data.type === "cron" && (!data.cron || data.cron.length === 0)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cron"], message: "cron is required when type=cron" });
    }
    if (data.type === "value" && (!data.value || data.value.length === 0)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["value"], message: "value is required when type=value" });
    }
});

const triggerSchemaProvider = new ZodSchemaProvider(triggerSchema);

export type TriggerRecord = z.infer<typeof triggerSchema>;
export { triggerSchemaProvider, triggerSchema };