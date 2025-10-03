import { pgTable, text, timestamp, uuid, numeric } from "drizzle-orm/pg-core";
import { z } from "zod";
import type { SchemaProvider } from "@/core/dependencies";

export const readingsTable = pgTable("readings", {
    id: uuid("id").primaryKey(),
    deviceId: uuid("device_id").notNull(),
    value: numeric("value").notNull(),
    timestamp: timestamp("timestamp").notNull()
});

// API-facing schema (decoupled from DB; keep POST simple)
const readingsRead = z.object({
    id: z.string().uuid(),
    deviceId: z.string().uuid(),
    value: z.union([z.number(), z.string()]),
    timestamp: z.string().datetime(),
});

const readingsCreate = z.object({
    deviceId: z.string().uuid(),
    value: z.union([z.number(), z.string()]),
    timestamp: z.string().datetime().optional(),
});

const readingsQuery = z.object({
    id: z.string().uuid().optional(),
    deviceId: z.string().uuid().optional(),
    value: z.string().optional(),
    timestamp: z.string().datetime().optional(),
});

const readingsSchemaProvider: SchemaProvider<any> & { getTable?: () => any } = {
    getSchema() {
        return {
            create: readingsCreate,
            read: readingsRead,
            update: readingsRead.partial(),
            query: readingsQuery,
        } as any;
    },
    listSchemas() { return ["default"]; },
    getTable() {
        return readingsTable;
    }
};
export type ReadingRecord = typeof readingsTable.$inferSelect;
export { readingsSchemaProvider };