import { DrizzleSchemaProvider } from "@/adapters/schema/drizzle";
import { jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

const deviceTableSchema = pgTable("devices", {
    id: uuid("id").notNull(),
    role: text("role").notNull(),
    driver: text("driver").notNull(),
    address: jsonb("address").notNull(),
    labels: jsonb("labels").default({}),
});


export const deviceSchema = createSelectSchema(deviceTableSchema);

const deviceSchemaProvider = new DrizzleSchemaProvider(deviceTableSchema);
export type DeviceRecord = z.infer<typeof deviceSchema>;
export { deviceSchemaProvider, deviceTableSchema };