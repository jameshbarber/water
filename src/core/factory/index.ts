import { Deps } from "@/deps";
import Module from "@/core/modules/module";
import { SchemaProvider } from "@/adapters/schema/types";

// Base binder for Module-like classes. Supports optional extra ctor args.
export const bindModuleFactory = <C extends typeof Module>(
  deps: Deps,
  ModuleCtor: C
) =>
  (name: string, schema: SchemaProvider, ...extra: ConstructorParameters<C> extends [any, ...infer R] ? R : never) =>
    new (ModuleCtor as any)({ name, store: deps.db, eventBus: deps.eventBus, schema }, ...extra);