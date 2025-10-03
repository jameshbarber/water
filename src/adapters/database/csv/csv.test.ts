import fs from "fs";
import path from "path";
import { CsvFileAdapter } from "./index";
import { NoopLogger } from "@/adapters/logging/noop";

const TEST_FILE = path.join(__dirname, "test.csv");
const logger = new NoopLogger();

describe("CsvFileAdapter", () => {
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

  it("creates file with headers if not exists", () => {
    const adapter = new CsvFileAdapter(TEST_FILE, logger, "test", ["id", "name"]);
    const content = fs.readFileSync(TEST_FILE, "utf8");
    expect(content).toBe("id,name\n");
  });

  it("uses existing headers if file exists", () => {
    fs.writeFileSync(TEST_FILE, "id,name,age\n");
    const adapter = new CsvFileAdapter(TEST_FILE, logger, "test");
    const content = fs.readFileSync(TEST_FILE, "utf8");
    expect(content).toBe("id,name,age\n");
  });

  it("reads and writes CSV data correctly", async () => {
    const adapter = new CsvFileAdapter<{id: string, name: string}>(TEST_FILE, logger, "test", ["id", "name"]);
    
    await adapter.create({ data: { id: "1", name: "Test" } });
    const content = fs.readFileSync(TEST_FILE, "utf8");
    expect(content).toBe("id,name\n1,Test\n");
    
    const found = await adapter.findOne({ where: { id: "1" } });
    expect(found).toEqual({ id: "1", name: "Test" });
  });

  it("handles empty values", async () => {
    const adapter = new CsvFileAdapter<{id: string, name: string}>(TEST_FILE, logger, "test", ["id", "name"]);
    
    await adapter.create({ data: { id: "1", name: "" } });
    const content = fs.readFileSync(TEST_FILE, "utf8");
    expect(content).toBe("id,name\n1,\n");
  });

  it("assigns v4 uuid if id not provided", async () => {
    const adapter = new CsvFileAdapter<{id: string, name: string}>(TEST_FILE, logger, "test", ["id", "name"]);
    const item = await adapter.create({ data: { name: "First" } as any });
    expect(typeof item.id).toBe("string");
    expect(item.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});
