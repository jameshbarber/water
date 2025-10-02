import { MqttDriver } from "./index";

describe("MqttDriver", () => {
    it("should be defined", () => {
        expect(MqttDriver).toBeDefined();
    });

    it("should read a value from a device", async () => {
        const cp = new MqttDriver({} as any);
        const value = await cp.read({ topic: "test" });
        expect(value).toBe("test");
    });

    it("should write a command to a device", async () => {
        const cp = new MqttDriver({} as any);
        await cp.write({ topic: "test" }, "test");
    });

    it("should throw an error if the device has no address", async () => {
        const cp = new MqttDriver({} as any);
        await expect(cp.read({ topic: "test" })).rejects.toThrow("Device has no address");
    });

    it("should throw an error if the device is not a sensor", async () => {
        const cp = new MqttDriver({} as any);
        await expect(cp.read({ topic: "test" })).rejects.toThrow("Device is not a sensor");
    });

    it("should throw an error if the device is not an actuator", async () => {
        const cp = new MqttDriver({} as any);
        await expect(cp.write({ topic: "test" }, "test")).rejects.toThrow("Device is not an actuator");
    });

    it("should throw an error if the device is not a both", async () => {
        const cp = new MqttDriver({} as any);
        await expect(cp.write({ topic: "test" }, "test")).rejects.toThrow("Device is not a both");
    });
});