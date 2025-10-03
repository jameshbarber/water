import { Logger } from "../logger";

export abstract class EventBus {
    logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    abstract emit(eventName: string, data: any): void;
    abstract on(eventName: string, callback: (data: any, eventName: string) => void): void;
}