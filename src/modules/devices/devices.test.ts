import { devicesModuleFactory } from "./factory";
import { makeDriver, makeDeps, makeModuleConfig } from "@/test/mocks";
import { deviceSchema } from "./index";

describe("Device Module", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        const deps = makeDeps();
        const mod = devicesModuleFactory(deps, { ...makeModuleConfig(deviceSchema) })();
        expect(mod).toBeDefined();
    });

    it("should send a command to a device", async () => {
        const deps = makeDeps();
        const device = { id: "1", role: "actuator", address: { x: 1 } };
        const store = deps.database.repo("devices");
        jest.spyOn(store, 'findOne').mockResolvedValue(device);

        const cp = makeDriver();
        const mod = devicesModuleFactory(deps, { ...makeModuleConfig(deviceSchema) })();
        
        await mod.sendCommand("1", "test");
        
        expect(cp.write).toHaveBeenCalledWith({ x: 1 }, "test");
        expect(deps.eventBus.emit).toHaveBeenCalledWith("device.command.sent", { id: "1", command: "test" });
    });
    
    it("should read a value from a device", async () => {
        const deps = makeDeps();
        const device = { id: "1", role: "sensor", address: { x: 1 } };
        const store = deps.database.repo("devices");
        jest.spyOn(store, 'findOne').mockResolvedValue(device);

        const cp = makeDriver();
        cp.read.mockResolvedValue("test");
        const mod = devicesModuleFactory(deps, { ...makeModuleConfig(deviceSchema) })();
        
        await mod.readValue("1");
        
        expect(cp.read).toHaveBeenCalledWith({ x: 1 });
        expect(deps.eventBus.emit).toHaveBeenCalledWith("device.value.read", { id: "1", value: "test" });
    });
    
    it("should throw an error if the send command device is not an actuator", async () => {
        const deps = makeDeps();
        const device = { id: "1", role: "sensor", address: { x: 1 } };
        const store = deps.database.repo("devices");
        jest.spyOn(store, 'findOne').mockResolvedValue(device);

        const cp = makeDriver();
        const mod = devicesModuleFactory(deps, { ...makeModuleConfig(deviceSchema) })();
        
        await expect(mod.sendCommand("1", "test")).rejects.toThrow("Device 1 is not an actuator");
    });
    
    it("should throw an error if the device has no address", async () => {
        const deps = makeDeps();
        const device = { id: "1", role: "actuator" };
        const store = deps.database.repo("devices");
        jest.spyOn(store, 'findOne').mockResolvedValue(device);

        const cp = makeDriver();
        const mod = devicesModuleFactory(deps, { ...makeModuleConfig(deviceSchema) })();
        
        await expect(mod.sendCommand("1", "test")).rejects.toThrow("Device 1 has no address");
    });
    
    it("should throw an error if the read value device is not a sensor", async () => {
        const deps = makeDeps();
        const device = { id: "1", role: "actuator", address: { x: 1 } };
        const store = deps.database.repo("devices");
        jest.spyOn(store, 'findOne').mockResolvedValue(device);

        const cp = makeDriver();
        const mod = devicesModuleFactory(deps, { ...makeModuleConfig(deviceSchema) })();
        
        await expect(mod.readValue("1")).rejects.toThrow("Device 1 is not a sensor");
    });
});