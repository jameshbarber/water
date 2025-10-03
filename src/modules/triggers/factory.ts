import type { Deps } from "@/deps";
import TriggerModule from "./module";
import { ModuleConfig } from "@/core/modules";
import { TriggerRecord } from "./schema";

export const triggersModuleFactory = (
  deps: Deps,
  config: ModuleConfig<TriggerRecord>,
) => {
  return () => {
    const module = new TriggerModule(config, deps);
    return module;
  };
};
