import { Deps } from "@/deps";
import { ControlProtocol, ControlProtocolAddress } from "@/core/dependencies/control-protocol";

interface MqttAddress extends ControlProtocolAddress {
    topic: string;
}

export class MqttControlProtocol extends ControlProtocol {
    private mqttClient: any;

    constructor(deps: Deps) {
        super(deps);
    }

    init() {
        // Implement MQTT init
    }

    read(address: MqttAddress): Promise<any> {
        // Implement MQTT read
        return this.mqttClient.read(address.topic);

    }

    write(address: MqttAddress, data: any): Promise<any> {
        // implement MQTT write
        return this.mqttClient.write(address.topic, data);
    }
}