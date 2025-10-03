import { AppManifest } from "@/core/app";
import { createApp } from "@/index";

// Make a controllable deps mock so we can assert behavior and inputs
const restStart = jest.fn();
const restRegister = jest.fn();
const createRoute = jest.fn();
const mcpStart = jest.fn();
const createDepsMock = jest.fn();

jest.mock("@/deps", () => {
  return {
    createDeps: jest.fn((manifest: AppManifest) => {
      createDepsMock(manifest);
      return {
        logger: {
          debug: jest.fn(),
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
          setLevel: jest.fn(),
          child: jest.fn(function () { return this as any; }),
        },
        db: {
          findOne: jest.fn(),
          findMany: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
        eventBus: {
          emit: jest.fn(),
          on: jest.fn(),
        },
        rest: {
          register: restRegister,
          start: restStart,
          createRoute,
        },
        mcp: {
          start: mcpStart,
        },
      } as any;
    }),
  };
});

describe("App manifest honoring", () => {
  beforeEach(() => {
    restStart.mockClear();
    restRegister.mockClear();
    createRoute.mockClear();
    mcpStart.mockClear();
    createDepsMock.mockClear();
  });

  it("starts only REST when enabled and MCP disabled", async () => {
    const manifest: AppManifest = {
      name: "water",
      version: "1.0.0",
      interfaces: {
        rest: { enabled: true, port: 3001, host: "127.0.0.1" },
        mcp: { enabled: false },
      },
      dependencies: { db: "json", schema: "zod", events: "simple" },
      modules: {
        devices: { schema: "zod", store: "json" },
        triggers: { schema: "zod", store: "json" },
      },
    };

    const { app } = await createApp(manifest);
    app.start();

    expect(restStart).toHaveBeenCalledWith(3001, "127.0.0.1");
    expect(mcpStart).not.toHaveBeenCalled();
    expect(createDepsMock).toHaveBeenCalledWith(manifest);
    expect(app.manifest).toBe(manifest);
    expect(restRegister).toHaveBeenCalledTimes(2);
  });

  it("starts MCP when enabled and REST disabled", async () => {
    const manifest: AppManifest = {
      name: "water",
      version: "1.0.0",
      interfaces: {
        rest: { enabled: false, port: 3001, host: "127.0.0.1" },
        mcp: { enabled: true },
      },
      dependencies: { db: "json", schema: "zod", events: "simple" },
      modules: {
        devices: { schema: "zod", store: "json" },
        triggers: { schema: "zod", store: "json" },
      },
    };

    const { app } = await createApp(manifest);
    app.start();

    expect(mcpStart).toHaveBeenCalled();
    expect(restStart).not.toHaveBeenCalled();
    expect(createDepsMock).toHaveBeenCalledWith(manifest);
    expect(app.manifest).toBe(manifest);
    expect(restRegister).not.toHaveBeenCalled();
  });

  it("starts both interfaces when both enabled", async () => {
    const manifest: AppManifest = {
      name: "water",
      version: "1.0.0",
      interfaces: {
        rest: { enabled: true, port: 4000, host: "0.0.0.0" },
        mcp: { enabled: true },
      },
      dependencies: { schema: "zod", events: "simple" },
      modules: {
        devices: { schema: "zod", store: "json" },
        triggers: { schema: "zod", store: "json" },
      },
    };

    const { app } = await createApp(manifest);
    app.start();

    expect(restStart).toHaveBeenCalledWith(4000, "0.0.0.0");
    expect(mcpStart).toHaveBeenCalled();
    expect(createDepsMock).toHaveBeenCalledWith(manifest);
    expect(app.manifest).toBe(manifest);
    expect(restRegister).toHaveBeenCalledTimes(2);
  });

  it("preserves name and version and passes through unchanged", async () => {
    const manifest: AppManifest = {
      name: "custom-name",
      version: "9.9.9",
      interfaces: {
        rest: { enabled: false, port: 1234, host: "host.local" },
        mcp: { enabled: false },
      },
      stores: {
        "json": {
          url: "test.json",
          type: "json",
        }
      },
      modules: {
        devices: { store: "json" },
      },
    };

    const { app } = await createApp(manifest);
    expect(app.name).toBe("custom-name");
    expect(app.manifest.version).toBe("9.9.9");
    expect(app.manifest).toBe(manifest);
  });
});


