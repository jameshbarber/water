import type { Deps } from "@/deps";
import type { SchemaProvider } from "@/adapters/schema/types";
import TriggerModule from "./module";

export const triggersModuleFactory = (
  deps: Deps,
  schema: SchemaProvider,
) => {
  return () => {
    const module = new TriggerModule({ name: "triggers", store: deps.db, eventBus: deps.eventBus, schema, logger: deps.logger });
    return module;
  };
};
