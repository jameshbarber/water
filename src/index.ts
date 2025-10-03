import { createDeps, Deps } from "./deps";
import { AppManifest } from "./core/app";
import App from "./core/app";
import { createSubscribers } from './subscribers'
import Module, { ModuleConfig } from "./core/modules";

const moduleFactory = (deps: Deps, CustomModuleConstructor?: typeof Module) => {
  return <T extends { id: string }>(config: ModuleConfig<T>) => {
    if (CustomModuleConstructor) {
      return new CustomModuleConstructor(config, deps);
    }
    return new Module(config, deps);
  }
}

export async function createApp(manifest: AppManifest) {
  const deps = createDeps(manifest);
  const app = new App(manifest, deps);
  const modules = Object.keys(manifest.modules);

  modules.forEach((module) => {
    const m = moduleFactory(deps)(Object.assign({ name: module }, manifest.modules[module] as any));
    app.register(m);
  });

  createSubscribers(deps);

  return { app, deps };
}