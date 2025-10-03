// tests/unit/module.test.ts
import Module from "@/core/modules";
import { makeSchema, makeModuleConfig, makeDeps } from "@/test/mocks";
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
    const mod = new Module({ ...makeModuleConfig(schema) }, makeDeps());
    expect(mod.name).toEqual("settings");
  });

  it("findOne forwards where.id and returns value", async () => {
    const deps = makeDeps();
    const store = deps.database.repo("settings") as any;
    store.findOne.mockResolvedValue({ id: "1", name: "A" });
    const mod = new Module({ ...makeModuleConfig(schema) }, deps);

    const out = await mod.findOne("1");
    expect(deps.database.repo).toHaveBeenCalled();
    expect(out).toEqual({ id: "1", name: "A" });
  });

  it("findOne throws when not found", async () => {
    const deps = makeDeps();
    const store = deps.database.repo("settings") as any;
    store.findOne.mockResolvedValue(null);
    const mod = new Module({ ...makeModuleConfig(schema)}, deps);

    await expect(mod.findOne("2")).rejects.toThrow("settings 2 not found");
    expect(deps.database.repo).toHaveBeenCalled();
  });

  it("findMany forwards where and returns list", async () => {
    const deps = makeDeps();
    const store = deps.database.repo("settings") as any;
    store.findMany.mockResolvedValue([{ id: "1" }]);
    const mod = new Module({ ...makeModuleConfig(schema) }, deps);

    const where = { name: "A" } as Partial<{ id: string; name: string }>;
    const out = await mod.findMany(where);

    expect(store.findMany).toHaveBeenCalledWith({ where });
    expect(out).toEqual([{ id: "1" }]);
  });


  it("create forwards data and returns created row", async () => {
    const deps = makeDeps();
    const store = deps.database.repo("settings") as any;
    store.create.mockResolvedValue({ id: "1", name: "A" });
    const mod = new Module({ ...makeModuleConfig(schema) }, deps);

    const data = { id: "1", name: "A" };
    const out = await mod.create(data);

    expect(store.create).toHaveBeenCalledWith({ data });
    expect(out).toEqual({ id: "1", name: "A" });
  });

  it("update forwards where.id and data, returns updated row", async () => {
    const deps = makeDeps();
    const store = deps.database.repo("settings") as any;
    store.update.mockResolvedValue({ id: "1", name: "B" });
    const mod = new Module({ ...makeModuleConfig(schema) }, deps);

    const out = await mod.update("1", { name: "B" } as Partial<{ id: string; name: string }>);

    expect(store.update).toHaveBeenCalledWith({ where: { id: "1" }, data: { name: "B" } });
    expect(out).toEqual({ id: "1", name: "B" });
  });

  it("delete forwards where.id and returns deleted row", async () => {
    const deps = makeDeps();
    const store = deps.database.repo("settings") as any;
    store.delete.mockResolvedValue({ id: "1", name: "A" });
    const mod = new Module({ ...makeModuleConfig(schema) }, deps);

    const out = await mod.delete("1");

    expect(store.delete).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(out).toEqual({ id: "1", name: "A" });
  });
});