import { Deps } from "@/deps";
import Module from "@/core/modules/module";
import { SchemaProvider } from "@/adapters/schema/types";

export const bindModuleFactory = (deps: Deps) => (name: string, schema: SchemaProvider) =>
    new Module({ name, store: deps.db, eventBus: deps.eventBus, schema });