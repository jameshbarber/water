import { AppManifest } from "@/core/app";
import { createApp } from "@/index";

// Mock deps to avoid real IO and to assert calls
jest.mock("@/deps", () => {
  return {
    createDeps: jest.fn((_manifest: AppManifest) => {
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
          register: jest.fn(),
          start: jest.fn(),
          createRoute: jest.fn(),
        },
        mcp: {
          start: jest.fn(),
        },
      } as any;
    }),
  };
});

describe("App initialization", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("creates the app and registers core modules", () => {
    const manifest: AppManifest = {
      name: "water",
      version: "1.0.0",
      interfaces: {
        rest: { enabled: true, port: 3000, host: "0.0.0.0" },
        mcp: { enabled: false },
      },
      dependencies: { schema: "zod", events: "simple" },
      modules: {
        devices: { schema: "zod", store: "json" },
        triggers: { schema: "zod", store: "json" },
      },
    };

    const { app, deps } = createApp(manifest);

    expect(app.name).toBe("water");
    expect(Object.keys(app.moduleConfigs)).toEqual(
      expect.arrayContaining(["devices", "triggers"])
    );
    expect((deps.rest as any).register).toHaveBeenCalledTimes(2);
  });
});


