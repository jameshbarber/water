import type { Deps } from "@/deps";
import DevicesModule from "./module";
import { DeviceRecord } from "./schema";
import { ModuleConfig } from "@/core/modules";

export const devicesModuleFactory = (
  deps: Deps,
  config: ModuleConfig<DeviceRecord>
) => {
  return () => {
    const module = new DevicesModule(config, deps);
    return module;
  };
};