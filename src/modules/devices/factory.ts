import type { Deps } from "@/deps";
import type { SchemaProvider } from "@/adapters/schema/types";
import type { Driver } from "@/core/dependencies/drivers";
import DevicesModule from "./module";

export const devicesModuleFactory = (
  deps: Deps,
  schema: SchemaProvider,
  driver: Driver
) => {
  return () => {
    const module = new DevicesModule(
    { name: "devices", store: deps.db, eventBus: deps.eventBus, schema },
    driver
  );
  return module;
  };
};