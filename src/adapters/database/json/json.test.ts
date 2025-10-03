import { ZodSchemaProvider } from "@/adapters/schema";
import { z } from "zod";

import fs from "fs";
import path from "path";
import { NoopLogger } from "@/adapters/logging/noop";
import { JsonFileAdapter } from "./index";
import { randomUUID } from "crypto";

const TEST_FILE = path.join(__dirname, "test.json");
const logger = new NoopLogger();


describe("ZodSchemaProvider", () => {
    it("registers and retrieves schemas", () => {
        

        const create = z.object({
            id: z.string().uuid().optional(),
            name: z.string(),
            age: z.number().int().min(0)
        });
        const provider = new ZodSchemaProvider(create);


        const schema = provider.getSchema();
        expect(schema).toBeDefined();
        expect(() => schema!.create.parse({ name: "A", age: 1 })).not.toThrow();
        expect(() => schema!.read.parse({ id: randomUUID(), name: "A", age: 1 })).not.toThrow();
    });
});



describe("JsonFileAdapter", () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_FILE)) {
      fs.unlinkSync(TEST_FILE);
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_FILE)) {
      fs.unlinkSync(TEST_FILE);
    }
  });

  it("creates empty JSON store if file not exists", () => {
    const adapter = new JsonFileAdapter(TEST_FILE, logger, "test");
    const content = fs.readFileSync(TEST_FILE, "utf8");
    expect(JSON.parse(content)).toEqual({});
  });

  it("uses existing data if file exists", () => {
    const initialData = { test: { items: [{ id: "1", name: "Test" }] } } as any;
    fs.writeFileSync(TEST_FILE, JSON.stringify(initialData));
    const adapter = new JsonFileAdapter(TEST_FILE, logger, "test");
    const found = adapter.findOne({ where: { id: "1" } });
    expect(found).resolves.toEqual({ id: "1", name: "Test" });
  });

  it("reads and writes JSON data correctly", async () => {
    const adapter = new JsonFileAdapter(TEST_FILE, logger, "test");
    
    const created = await adapter.create({ data: { id: "1", name: "Test" } });
    const content = fs.readFileSync(TEST_FILE, "utf8");
    expect(JSON.parse(content)).toEqual({ 
      test: { items: [{ id: "1", name: "Test" }] }
    });
    expect(created.id).toEqual("1");
    const found = await adapter.findOne({ where: { id: "1" } });
    expect(found).toEqual({ id: "1", name: "Test" });
  });

  it("assigns v4 uuid if id not provided", async () => {
    const adapter = new JsonFileAdapter(TEST_FILE, logger, "test");
    const item = await adapter.create({ data: { name: "First" } as any });
    expect(typeof item.id).toBe("string");
    expect(item.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("updates existing records", async () => {
    const adapter = new JsonFileAdapter<{id: string, name: string}>(TEST_FILE, logger, "test");
    
    await adapter.create({ data: { id: "1", name: "Original" } });
    const updated = await adapter.update({ 
      where: { id: "1" }, 
      data: { name: "Updated" } 
    });
    
    expect(updated).toEqual({ id: "1", name: "Updated" });
    const found = await adapter.findOne({ where: { id: "1" } });
    expect(found).toEqual({ id: "1", name: "Updated" });
  });

  it("deletes records", async () => {
    const adapter = new JsonFileAdapter(TEST_FILE, logger, "test");
    
    await adapter.create({ data: { id: "1", name: "Test" } });
    const deleted = await adapter.delete({ where: { id: "1" } });
    
    expect(deleted).toEqual({ id: "1", name: "Test" });
    const found = await adapter.findOne({ where: { id: "1" } });
    expect(found).toBeNull();
  });

  it("finds multiple records", async () => {
    const adapter = new JsonFileAdapter<{id: string, name: string}>(TEST_FILE, logger, "test");
    
    await adapter.create({ data: { id: "1", name: "Test" } });
    await adapter.create({ data: { id: "2", name: "Test" } });
    await adapter.create({ data: { id: "3", name: "Different" } });
    
    const found = await adapter.findMany({ where: { name: "Test" } });
    expect(found).toHaveLength(2);
    expect(found).toEqual([
      { id: "1", name: "Test" },
      { id: "2", name: "Test" }
    ]);
  });
});
