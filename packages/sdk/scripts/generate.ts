import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import openapiTS from "openapi-typescript";

// This script imports the app manifest and uses the existing OpenAPI generator to emit a spec.
// Then it runs openapi-typescript to generate `src/types.ts` for the SDK.

async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
  const srcIndex = resolve(root, "src/index.ts");
  // Dynamically import the app and manifest
  const { createApp } = await import(srcIndex);
  const manifest = (await import(resolve(root, "src/config.ts"))).default;

  const { deps } = await createApp(manifest);
  const schema = deps.rest?.generateDocs();
  if (!schema) {
    throw new Error("Failed to generate OpenAPI schema");
  }

  // Write openapi.json in package
  const pkgDir = resolve(root, "packages/sdk");
  const openapiPath = resolve(pkgDir, "openapi.json");
  writeFileSync(openapiPath, JSON.stringify(schema, null, 2), "utf8");

  // Generate types
  const dtsRaw = await openapiTS(schema as any, { exportType: false });
  const dts = Array.isArray(dtsRaw) ? dtsRaw.join("\n") : String(dtsRaw);
  const srcDir = resolve(pkgDir, "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(resolve(srcDir, "types.ts"), dts, "utf8");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


