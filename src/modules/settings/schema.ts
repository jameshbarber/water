import { pgTable, text } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { DrizzleSchemaProvider } from "@/adapters/schema/drizzle";

const settingsTableSchema = pgTable("settings", {
    id: text("id").notNull(),
    value: text("value").notNull().default(""),
});

export const settingsSchema = createSelectSchema(settingsTableSchema);

export type SettingRecord = z.infer<typeof settingsSchema>;

const settingsSchemaProvider = new DrizzleSchemaProvider(settingsTableSchema);
export { settingsSchemaProvider, settingsTableSchema };