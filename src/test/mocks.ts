import { ZodSchemaProvider } from "@/adapters/schema";
import type { SchemaProvider } from "@/adapters/schema/types";
import type { EventBus } from "@/core/dependencies/events";
import { ModuleConfig } from "@/core/modules";
import { z } from "zod";

export const makeDbSchema = () => {
  return {
    findOne: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as any;
};

export const makeEventBus = () => {
  return {
    emit: jest.fn(),
    on: jest.fn(),
  } as unknown as EventBus;
};

export const makeSchema = (schema: z.ZodObject): SchemaProvider => {
  const schemaProvider = new ZodSchemaProvider(schema);
  return schemaProvider as unknown as SchemaProvider;
};

export const makeModuleConfig = (schema: z.ZodObject) => {
  return {
    store: makeDbSchema(),
    name: "settings",
    eventBus: makeEventBus(),
    schema: makeSchema(schema),
    logger: makeLogger(),
  } as ModuleConfig<any>;
};

export const makeDriver = () => {
  return {
    write: jest.fn(),
    read: jest.fn(),
  } as any;
};



export const makeDeps = () => {
  return {
    db: makeDbSchema(),
    eventBus: makeEventBus(),
  } as any;
};

export const makeLogger = () => {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as any;
};