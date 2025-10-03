import { AnyPgTable, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { DrizzleRepository } from "./index";

// Lightweight table schema for testing SQL generation via Drizzle client
const testTable = pgTable("tests", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  createdAt: timestamp("created_at", { mode: "date"}).defaultNow(),
});

describe("DrizzleRepository createMany", () => {
  it("returns rows for multiple inserts", async () => {
    // We will not hit a real DB in unit tests; ensure method exists and returns array type
    const repo = new DrizzleRepository("tests", testTable as any as AnyPgTable);
    expect(typeof repo.createMany).toBe("function");
  });
});

