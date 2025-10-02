// tests/unit/module.test.ts
import Module from "@/core/modules/module";

const makeDbSchema = () => {
  return {
    findOne: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
};

const makeEventBus = () => {
  return {
    emit: jest.fn(),
    on: jest.fn(),
  } as unknown as EventBus;
};

describe("Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("has a name", () => {
    const db = makeDbSchema();
    const eventBus = makeEventBus();
    const mod = new Module({ db: db as any, name: "settings", eventBus });
    expect(mod.name).toEqual("settings");
  });
 
  it("findOne forwards where.id and returns value", async () => {
    const db = makeDbSchema();
    db.findOne.mockResolvedValue({ id: "1", name: "A" });
    const eventBus = makeEventBus();
    const mod = new Module({ db: db as any, name: "settings", eventBus });

    const out = await mod.findOne("1");

    expect(db.findOne).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(out).toEqual({ id: "1", name: "A" });
  });

  it("findOne propagates null when not found", async () => {
    const db = makeDbSchema();
    db.findOne.mockResolvedValue(null);
    const eventBus = makeEventBus();
    const mod = new Module({ db: db as any, name: "settings", eventBus });

    const out = await mod.findOne("2");

    expect(db.findOne).toHaveBeenCalledWith({ where: { id: "2" } });
    expect(out).toBeNull();
  });

  it("findMany forwards where and returns list", async () => {
    const db = makeDbSchema();
    db.findMany.mockResolvedValue([{ id: "1" }]);
    const eventBus = makeEventBus();
    const mod = new Module({ store: db as any, name: "settings", eventBus });

    const where = { name: "A" };
    const out = await mod.findMany(where);

    expect(db.findMany).toHaveBeenCalledWith({ where });
    expect(out).toEqual([{ id: "1" }]);
  });

  it("create forwards data and returns created row", async () => {
    const db = makeDbSchema();
    db.create.mockResolvedValue({ id: "1", name: "A" });
    const eventBus = makeEventBus();
    const mod = new Module({ db: db as any, name: "settings", eventBus });

    const data = { name: "A" };
    const out = await mod.create(data);

    expect(db.create).toHaveBeenCalledWith({ data });
    expect(out).toEqual({ id: "1", name: "A" });
  });

  it("update forwards where.id and data, returns updated row", async () => {
    const db = makeDbSchema();
    db.update.mockResolvedValue({ id: "1", name: "B" });
    const eventBus = makeEventBus();
    const mod = new Module({ db: db as any, name: "settings", eventBus });

    const out = await mod.update("1", { name: "B" });

    expect(db.update).toHaveBeenCalledWith({ where: { id: "1" }, data: { name: "B" } });
    expect(out).toEqual({ id: "1", name: "B" });
  });

  it("delete forwards where.id and returns deleted row", async () => {
    const db = makeDbSchema();
    db.delete.mockResolvedValue({ id: "1", name: "A" });
    const eventBus = makeEventBus();
    const mod = new Module({ db: db as any, name: "settings", eventBus });

    const out = await mod.delete("1");

    expect(db.delete).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(out).toEqual({ id: "1", name: "A" });
  });
});