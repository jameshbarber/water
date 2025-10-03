import { createApp } from "@/index";
import { AppManifest } from "@/core/app";
import { ZodSchemaProvider } from "@/adapters/schema";
import { z } from "zod";

const testManifest: AppManifest = {
  name: "test-app",
  version: "1.0.0",
  interfaces: {
    rest: {
      enabled: true,
      host: "localhost",
      port: 3000
    }
  },
  modules: {
    settings: {
      schema: new ZodSchemaProvider(z.object({ id: z.string(), value: z.string() }))
    }
  }
};

describe("OpenAPI Schema Generation", () => {
  it("should generate valid OpenAPI schema for a basic app", () => {

    const { deps } = createApp(testManifest);
    const schema = deps.rest?.generateDocs();

    expect(schema).toBeDefined();
    expect(schema?.openapi).toBe("3.0.0");
    expect(schema?.paths).toBeDefined();
    expect(schema?.components?.schemas).toBeDefined();
  });

  it("should include module endpoints in OpenAPI schema", () => {
    const { deps } = createApp(testManifest);
    const schema = deps.rest?.generateDocs();

    expect(schema?.paths?.["/settings"]).toBeDefined();
    expect(schema?.paths?.["/settings/{id}"]).toBeDefined();
    expect(schema?.components?.schemas?.["settings"]).toBeDefined();
  });
});
