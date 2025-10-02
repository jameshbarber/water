import DevicesModule from "./module";
import { makeDbSchema, makeEventBus, makeSchema, makeModuleConfig, makeControlProtocol } from "@/test/mocks";

describe("Device Module", () => {
    it("should be defined", () => {
        const db = makeDbSchema();
        const eventBus = makeEventBus();
        const mod = new DevicesModule({ store: db as any, name: "devices", eventBus, schema: makeSchema() }, makeControlProtocol());
        expect(mod).toBeDefined();
    });


    it("should send a command to a device", async () => {
        const db = makeDbSchema();
        const eventBus = makeEventBus();
        const mod = new DevicesModule(makeModuleConfig(), makeControlProtocol());
        await mod.sendCommand("1", "test");
        expect(eventBus.emit).toHaveBeenCalledWith("device.command.sent", { id: "1", command: "test" });
    });
    
    it("should read a value from a device", async () => {
        const db = makeDbSchema();
        const eventBus = makeEventBus();
        const mod = new DevicesModule(makeModuleConfig(), makeControlProtocol());
        await mod.readValue("1");
        expect(eventBus.emit).toHaveBeenCalledWith("device.value.read", { id: "1", value: "test" });
    });
    
    it("should throw an error if the send command device is not an actuator", async () => {
        const db = makeDbSchema();
        const eventBus = makeEventBus();
        const mod = new DevicesModule({ store: db as any, name: "devices", eventBus, schema: makeSchema() }, makeControlProtocol());
        await expect(mod.sendCommand("1", "test")).rejects.toThrow("Device 1 is not an actuator");
    });
    
    it("should throw an error if the device has no address", async () => {
        const db = makeDbSchema();
        const eventBus = makeEventBus();
        const mod = new DevicesModule({ store: db as any, name: "devices", eventBus, schema: makeSchema() }, makeControlProtocol());
        await expect(mod.sendCommand("1", "test")).rejects.toThrow("Device 1 has no address");
    });
    
    it("should throw an error if the read value device is not a sensor", async () => {
        const db = makeDbSchema();
        const eventBus = makeEventBus();
        const mod = new DevicesModule({ store: db as any, name: "devices", eventBus, schema: makeSchema() }, makeControlProtocol());
        await expect(mod.readValue("1")).rejects.toThrow("Device 1 is not a sensor");
    });
    
});