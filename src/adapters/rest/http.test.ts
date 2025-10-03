import request from "supertest";
import { createApp } from "@/index";
import manifest from "@/config";

describe("REST repos map to correct collections", () => {
  it("/devices, /triggers, /commands do not return settings entries", async () => {
    const { deps } = await createApp(manifest);
    deps.rest?.serveDocs();

    // seed settings
    await deps.database.repo("settings").create({ data: { id: "manifest", value: "x" } as any });

    const server: any = (deps.rest as any).server;
    const resDevices = await request(server).get("/devices");
    expect(Array.isArray(resDevices.body)).toBe(true);
    expect(resDevices.body.every((x: any) => x?.id !== "manifest")).toBe(true);

    const resTriggers = await request(server).get("/triggers");
    expect(Array.isArray(resTriggers.body)).toBe(true);
    expect(resTriggers.body.every((x: any) => x?.id !== "manifest")).toBe(true);

    const resCommands = await request(server).get("/commands");
    expect(Array.isArray(resCommands.body)).toBe(true);
    expect(resCommands.body.every((x: any) => x?.id !== "manifest")).toBe(true);
  });

  it("/settings/:id returns findOne(id)", async () => {
    const { deps } = await createApp(manifest);
    const server: any = (deps.rest as any).server;

    await deps.database.repo("settings").create({ data: { id: "name", value: "water" } as any });

    const res = await request(server).get("/settings/name");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: "name", value: "water" });
  });
});


