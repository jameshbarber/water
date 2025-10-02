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
        if (!address || !address.topic) {
            return Promise.reject(new Error("Device has no address"));
        }
        return this.subscribe(address.topic);

    }

    write(address: MqttAddress, data: any): Promise<any> {
        if (!address || !address.topic) {
            return Promise.reject(new Error("Device has no address"));
        }
        return this.publish(address.topic, data);
    }

    private async connect() {
        // Implement MQTT connect
    }

    private async disconnect() {
        // Implement MQTT disconnect
    }

    private async subscribe(topic: string) {
        // Demo stub
        return "test";
    }

    private async unsubscribe(topic: string) {
        // Implement MQTT unsubscribe
    }

    private async publish(topic: string, message: any) {
        // Demo stub
        return;
    }

    private async onMessage(topic: string, message: any) {
        // Implement MQTT onMessage
    }

    private async onError(error: any) {
        // Implement MQTT onError
    }

    private async onClose() {
        // Implement MQTT onClose
    }
}