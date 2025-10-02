import type { Deps } from "@/deps";
import type { SchemaProvider } from "@/adapters/schema/types";
import type { ControlProtocol } from "@/core/dependencies/drivers";
import DevicesModule from "./module";

export const devicesModuleFactory = (
  deps: Deps,
  schema: SchemaProvider,
  commandProtocol: ControlProtocol
) => {
  return () => {
    const module = new DevicesModule(
    { name: "devices", store: deps.db, eventBus: deps.eventBus, schema },
    commandProtocol
  );
  return module;
  };
};