import { Deps } from "@/deps";
import { MqttControlProtocol } from "./mqtt";
import { HttpControlProtocol } from "./http";

export class ControlProtocolFactory {
    static create(deps: Deps, driver: string) {
        switch (driver) {
            case "mqtt":
                return new MqttControlProtocol(deps);
            case "http":
                return new HttpControlProtocol(deps);
            default:
                throw new Error(`Driver ${driver} not supported`);
        }
    }
}