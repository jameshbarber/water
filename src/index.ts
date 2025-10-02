import { createDeps } from "./deps";
import { bindModuleFactory } from "./core/factory";
import { AppManifest } from "./core/app";
import App from "./core/app";

export function createApp(manifest: AppManifest) {
    const deps = createDeps(manifest);
    const makeModule = bindModuleFactory(deps);
  
    const app = new App(manifest, deps);
    for (const name of Object.keys(manifest.modules)) {
      app.register(name, manifest.modules[name].schema, manifest.modules[name].store);
      // attach routes per module here if desired
      // app.getApp().use(`/api/${name}`, buildRouter(mod));
    }
    return { app, deps };
  }