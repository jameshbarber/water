import { createDeps } from "./deps";
import { AppManifest } from "./core/app";
import App from "./core/app";
import { deviceSchemaProvider } from "./modules/devices";
import { devicesModuleFactory } from "./modules/devices/factory";
import { triggerSchemaProvider, triggersModuleFactory } from "./modules/triggers";
import { Driver } from "./core/dependencies/drivers";
import { createSubscribers } from './subscribers'

export function createApp(manifest: AppManifest) {
  const deps = createDeps(manifest);
  const app = new App(manifest, deps);

  // Register modules
  app.register(devicesModuleFactory(deps, deviceSchemaProvider, new Driver(deps))());
  app.register(triggersModuleFactory(deps, triggerSchemaProvider)());

  createSubscribers(deps);

  return { app, deps };
}