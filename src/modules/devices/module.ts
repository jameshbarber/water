import Module from "@/core/modules";
import { ModuleConfig } from "@/core/modules";
import { DeviceRecord } from "./schema";
import AppError from "@/core/error";
import { Deps } from "@/deps";

class DevicesModule extends Module<DeviceRecord> {

    constructor(config: ModuleConfig<DeviceRecord>, deps: Deps) {
        super(config, deps);
        this.addRoute({
            path: "/devices/:id/command",
            method: "post",
            summary: "Send a command to a device",
            description: "Send a command to a device",
            handler: async (req: any, res: any) => {
                await this.sendCommand(req.params.id, req.body.command);
                return res.json({ message: "Command sent" });
            },
        });
        this.addRoute({
            path: "/devices/:id/value",
            method: "get",
            summary: "Read a value from a device",
            description: "Read a value from a device",
            handler: async (req: any, res: any) => {
                await this.readValue(req.params.id);
            },
        });
    }

    async sendCommand(id: string, command: string) {
        const device = await this.findOne(id);
        const role = device.role;
        if (role !== "actuator" && role !== "both") {
            throw new AppError(`Device ${id} is not an actuator`);
        }
        if (!device.address) {
            throw new AppError(`Device ${id} has no address`);
        }

        await this.deps.driver.write(device.address, command);
        await this.deps.eventBus.emit(`device.command.sent`, { id, command });
    }

    async readValue(id: string) {
        const device = await this.findOne(id);
        const role = device.role;
        if (role !== "sensor" && role !== "both") {
            throw new AppError(`Device ${id} is not a sensor`);
        }
        if (!device.address) {
            throw new AppError(`Device ${id} has no address`);
        }
        const value = await this.deps.driver.read(device.address);
        await this.deps.eventBus.emit(`device.value.read`, { id, value });
        return value;
    }
}

export default DevicesModule;