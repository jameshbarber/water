import { ZodSchemaProvider } from "@/adapters/schema";
import type { SchemaProvider } from "@/adapters/schema/types";
import type { EventBus } from "@/core/dependencies/events";
import { ModuleConfig } from "@/core/modules";
import { Deps } from "@/deps";
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

export const makeDb = () => {
  const singleton = makeDbRepo();
  return {
    repo: jest.fn((_key: string) => singleton),
  } as any;
};

export const makeDbRepo = () => {
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

export const makeSchema = (schema: z.ZodObject): SchemaProvider<any> => {
  const schemaProvider = new ZodSchemaProvider(schema);
  return schemaProvider as unknown as SchemaProvider<any>;
};

export const makeModuleConfig = (schema: z.ZodObject) => {
  return {
    name: "settings",
    schemas: makeSchema(schema),
  } as ModuleConfig<any>;
};

let __driverSingleton: any;
export const makeDriver = () => {
  if (!__driverSingleton) {
    __driverSingleton = {
      write: jest.fn(),
      read: jest.fn(),
    } as any;
  }
  return __driverSingleton;
};



export const makeDeps = (): Deps => {
  return {
    makeModuleDataStore: ()=>(schemas: SchemaProvider<any>)=>jest.fn(),
    logger: makeLogger(),
    eventBus: makeEventBus(),
    database: makeDb(),
    driver: makeDriver(),
  } as any;
};

export const makeLogger = () => {
  return {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as any;
};


export const makeStore = () => {
  return {
    findOne: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as any;
};