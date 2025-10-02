import { ControlProtocolAddress } from "@/core/dependencies/control-protocol";
import { Deps } from "@/deps";

export class MqttControlProtocol {
    
    deps: Deps;

    constructor(deps: Deps) {
        this.deps = deps;
    }

    read(address: ControlProtocolAddress): Promise<any> {
        throw new Error("Not implemented");
    }

    write(address: ControlProtocolAddress, data: any): Promise<any> {
        throw new Error("Not implemented");
    }
}