import { createDeps } from "./deps";
import { AppManifest } from "./core/app";
import App from "./core/app";
import { deviceSchemaProvider } from "./modules/devices";
import { devicesModuleFactory } from "./modules/devices/factory";
import { ControlProtocol } from "./core/dependencies/control-protocol";

export function createApp(manifest: AppManifest) {
  const deps = createDeps(manifest);
  const app = new App(manifest, deps);

  // Register modules
  app.register(devicesModuleFactory(deps, deviceSchemaProvider, new ControlProtocol(deps))());

  return { app, deps };
}