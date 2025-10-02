import Module from "@/core/modules/module";
import { ModuleConfig } from "@/core/modules/module";
import { DeviceRecord } from "./index";
import { ControlProtocol } from "@/core/dependencies/control-protocol";
import AppError from "@/core/error";

class DevicesModule extends Module<DeviceRecord> {
    commandProtocol: ControlProtocol;

    constructor(config: ModuleConfig<DeviceRecord>, commandProtocol: ControlProtocol) {
        super(config);
        this.commandProtocol = commandProtocol;

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
        await this.commandProtocol.write(device.address, command);
        await this.eventBus.emit(`device.command.sent`, { id, command });
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
        const value = await this.commandProtocol.read(device.address);
        await this.eventBus.emit(`device.value.read`, { id, value });
        return value;
    }
}

export default DevicesModule;