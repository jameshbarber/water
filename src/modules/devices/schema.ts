import { ZodSchemaProvider } from "@/adapters/schema";
import { z } from "zod";

const deviceSchemaProvider = new ZodSchemaProvider();

const deviceSchema = z.object({
    id: z.string(),
    role: z.enum(["sensor", "actuator", "both"]),
    driver: z.enum(["gpio", "mqtt", "http"]),
    address: z.record(z.string(), z.any()),
    labels: z.record(z.string(), z.string()).optional(),
});

deviceSchemaProvider.create("devices", {
    create: deviceSchema.pick({ id: true, role: true, driver: true, address: true }),
    read: deviceSchema,
    query: deviceSchema.partial(),
});

export type DeviceRecord = z.infer<typeof deviceSchema>;
export { deviceSchemaProvider, deviceSchema };