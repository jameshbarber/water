import { ZodSchemaProvider } from "@/adapters/schema";
import { z } from "zod";

const deviceSchema = z.object({
    id: z.string(),
    role: z.enum(["sensor", "actuator", "both"]),
    driver: z.enum(["gpio", "mqtt", "http"]),
    address: z.record(z.string(), z.any()),
    labels: z.record(z.string(), z.string()).optional(),
});

const deviceSchemaProvider = new ZodSchemaProvider(deviceSchema);

export type DeviceRecord = z.infer<typeof deviceSchema>;
export { deviceSchemaProvider, deviceSchema };