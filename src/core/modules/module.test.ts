// tests/unit/module.test.ts
import Module from "@/core/modules";
import { makeDbSchema, makeEventBus, makeSchema, makeModuleConfig } from "@/test/mocks";
// local schema used in tests can be set up through makeSchema if needed
import { z } from "zod";

const schema = z.object({
  id: z.string(),
  name: z.string(),
});

const schemaProvider = makeSchema(schema);

describe("Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("has a name", () => {
    const mod = new Module(makeModuleConfig(schema));
    expect(mod.name).toEqual("settings");
  });

  it("findOne forwards where.id and returns value", async () => {
    const db = makeDbSchema();
    db.findOne.mockResolvedValue({ id: "1", name: "A" });
    const mod = new Module({ ...makeModuleConfig(schema), store: db as any });

    const out = await mod.findOne("1");
    expect(db.findOne).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(out).toEqual({ id: "1", name: "A" });
  });

  it("findOne throws when not found", async () => {
    const db = makeDbSchema();
    db.findOne.mockResolvedValue(null);
    const mod = new Module({ ...makeModuleConfig(schema), store: db as any });

    await expect(mod.findOne("2")).rejects.toThrow("settings 2 not found");
    expect(db.findOne).toHaveBeenCalledWith({ where: { id: "2" } });
  });

  it("findMany forwards where and returns list", async () => {
    const db = makeDbSchema();
    db.findMany.mockResolvedValue([{ id: "1" }]);
    const mod = new Module({ ...makeModuleConfig(schema), store: db as any });

    const where = { name: "A" } as Partial<{ id: string; name: string }>;
    const out = await mod.findMany(where);

    expect(db.findMany).toHaveBeenCalledWith({ where });
    expect(out).toEqual([{ id: "1" }]);
  });

  it("create forwards data and returns created row", async () => {
    const db = makeDbSchema();
    db.create.mockResolvedValue({ id: "1", name: "A" });
    const mod = new Module({ ...makeModuleConfig(schema), store: db as any });

    const data = { id: "1", name: "A" };
    const out = await mod.create(data);

    expect(db.create).toHaveBeenCalledWith({ data });
    expect(out).toEqual({ id: "1", name: "A" });
  });

  it("update forwards where.id and data, returns updated row", async () => {
    const db = makeDbSchema();
    db.update.mockResolvedValue({ id: "1", name: "B" });
    const mod = new Module({ ...makeModuleConfig(schema), store: db as any });

    const out = await mod.update("1", { name: "B" } as Partial<{ id: string; name: string }>);

    expect(db.update).toHaveBeenCalledWith({ where: { id: "1" }, data: { name: "B" } });
    expect(out).toEqual({ id: "1", name: "B" });
  });

  it("delete forwards where.id and returns deleted row", async () => {
    const db = makeDbSchema();
    db.delete.mockResolvedValue({ id: "1", name: "A" });
    const mod = new Module({ ...makeModuleConfig(schema), store: db as any });

    const out = await mod.delete("1");

    expect(db.delete).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(out).toEqual({ id: "1", name: "A" });
  });
});