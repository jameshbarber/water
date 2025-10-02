import { devicesModuleFactory } from "./factory";
import { makeSchema, makeDriver, makeDeps } from "@/test/mocks";

describe("Device Module", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        const deps = makeDeps();
        const cp = makeDriver();
        const mod = devicesModuleFactory(deps, makeSchema(), cp)();
        expect(mod).toBeDefined();
    });

    it("should send a command to a device", async () => {
        const deps = makeDeps();
        deps.db.findOne.mockResolvedValue({ id: "1", role: "actuator", address: { x: 1 } });
        const cp = makeDriver();
        const mod = devicesModuleFactory(deps, makeSchema(), cp)();
        await mod.sendCommand("1", "test");
        expect(cp.write).toHaveBeenCalledWith({ x: 1 }, "test");
        expect(deps.eventBus.emit).toHaveBeenCalledWith("device.command.sent", { id: "1", command: "test" });
    });
    
    it("should read a value from a device", async () => {
        const deps = makeDeps();
        deps.db.findOne.mockResolvedValue({ id: "1", role: "sensor", address: { x: 1 } });
        const cp = makeDriver();
        cp.read.mockResolvedValue("test");
        const mod = devicesModuleFactory(deps, makeSchema(), cp)();
        await mod.readValue("1");
        expect(cp.read).toHaveBeenCalledWith({ x: 1 });
        expect(deps.eventBus.emit).toHaveBeenCalledWith("device.value.read", { id: "1", value: "test" });
    });
    
    it("should throw an error if the send command device is not an actuator", async () => {
        const deps = makeDeps();
        deps.db.findOne.mockResolvedValue({ id: "1", role: "sensor", address: { x: 1 } });
        const cp = makeDriver();
        const mod = devicesModuleFactory(deps, makeSchema(), cp)();
        await expect(mod.sendCommand("1", "test")).rejects.toThrow("Device 1 is not an actuator");
    });
    
    it("should throw an error if the device has no address", async () => {
        const deps = makeDeps();
        deps.db.findOne.mockResolvedValue({ id: "1", role: "actuator" });
        const cp = makeDriver();
        const mod = devicesModuleFactory(deps, makeSchema(), cp)();
        await expect(mod.sendCommand("1", "test")).rejects.toThrow("Device 1 has no address");
    });
    
    it("should throw an error if the read value device is not a sensor", async () => {
        const deps = makeDeps();
        deps.db.findOne.mockResolvedValue({ id: "1", role: "actuator", address: { x: 1 } });
        const cp = makeDriver();
        const mod = devicesModuleFactory(deps, makeSchema(), cp)();
        await expect(mod.readValue("1")).rejects.toThrow("Device 1 is not a sensor");
    });
});