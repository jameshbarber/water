import fs from "fs";
import path from "path";
import { JsonFileAdapter } from "./index";

const TEST_FILE = path.join(__dirname, "test.json");

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
    const adapter = new JsonFileAdapter(TEST_FILE);
    const content = fs.readFileSync(TEST_FILE, "utf8");
    expect(JSON.parse(content)).toEqual({ items: [] });
  });

  it("uses existing data if file exists", () => {
    const initialData = { items: [{ id: 1, name: "Test" }] };
    fs.writeFileSync(TEST_FILE, JSON.stringify(initialData));
    const adapter = new JsonFileAdapter(TEST_FILE);
    const found = adapter.findOne({ where: { id: 1 } });
    expect(found).resolves.toEqual({ id: 1, name: "Test" });
  });

  it("reads and writes JSON data correctly", async () => {
    const adapter = new JsonFileAdapter<{id: number, name: string}>(TEST_FILE);
    
    await adapter.create({ data: { id: 1, name: "Test" } });
    const content = fs.readFileSync(TEST_FILE, "utf8");
    expect(JSON.parse(content)).toEqual({ 
      items: [{ id: 1, name: "Test" }] 
    });
    
    const found = await adapter.findOne({ where: { id: 1 } });
    expect(found).toEqual({ id: 1, name: "Test" });
  });

  it("assigns v4 uuid if id not provided", async () => {
    const adapter = new JsonFileAdapter<{id: string, name: string}>(TEST_FILE);
    const item = await adapter.create({ data: { name: "First" } as any });
    expect(typeof item.id).toBe("string");
    expect(item.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("updates existing records", async () => {
    const adapter = new JsonFileAdapter<{id: number, name: string}>(TEST_FILE);
    
    await adapter.create({ data: { id: 1, name: "Original" } });
    const updated = await adapter.update({ 
      where: { id: 1 }, 
      data: { name: "Updated" } 
    });
    
    expect(updated).toEqual({ id: 1, name: "Updated" });
    const found = await adapter.findOne({ where: { id: 1 } });
    expect(found).toEqual({ id: 1, name: "Updated" });
  });

  it("deletes records", async () => {
    const adapter = new JsonFileAdapter<{id: number, name: string}>(TEST_FILE);
    
    await adapter.create({ data: { id: 1, name: "Test" } });
    const deleted = await adapter.delete({ where: { id: 1 } });
    
    expect(deleted).toEqual({ id: 1, name: "Test" });
    const found = await adapter.findOne({ where: { id: 1 } });
    expect(found).toBeNull();
  });

  it("finds multiple records", async () => {
    const adapter = new JsonFileAdapter<{id: number, name: string}>(TEST_FILE);
    
    await adapter.create({ data: { id: 1, name: "Test" } });
    await adapter.create({ data: { id: 2, name: "Test" } });
    await adapter.create({ data: { id: 3, name: "Different" } });
    
    const found = await adapter.findMany({ where: { name: "Test" } });
    expect(found).toHaveLength(2);
    expect(found).toEqual([
      { id: 1, name: "Test" },
      { id: 2, name: "Test" }
    ]);
  });
});
