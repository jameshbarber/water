// A control protocol is a module that enables the communication with the hardware.
// Implementations might be: MQTT, Serial, HTTP, GPIO, etc. and needs to be extended for each implementation.
// It defines read and write methods, which are used by actuators and sensors.
import { Deps } from "@/deps";

export type DriverAddress = Record<string, any>;

export class Driver {
    deps: Deps;

    constructor(deps: Deps) {
        this.deps = deps;
    }

    read(address: DriverAddress): Promise<any> {
        throw new Error("Not implemented");
    }

    write(address: DriverAddress, data: any): Promise<any> {
        throw new Error("Not implemented");
    }
}