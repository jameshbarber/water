import { Deps } from "@/deps";
import { MqttDriver } from "./mqtt";
import { HttpDriver } from "./http";

export class DriverFactory {
    static create(deps: Deps, driver: string) {
        switch (driver) {
            case "mqtt":
                return new MqttDriver(deps);
            case "http":
                return new HttpDriver(deps);
            default:
                throw new Error(`Driver ${driver} not supported`);
        }
    }
}