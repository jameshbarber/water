import { EventBus } from "@/core/dependencies/events";
import { Logger } from "@/core/dependencies/logger";

class SimpleEventBus extends EventBus {
    private events: { [key: string]: ((data: any) => void)[] } = {};
    private wildcardEvents: ((data: any) => void)[] = [];

    constructor(logger: Logger) {
        super(logger);
    }

    emit<T>(eventName: string, data: T) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.wildcardEvents.forEach(callback => callback(data));
        this.events[eventName].forEach(callback => callback(data));
    }

    on<T>(eventName: string, callback: (data: T) => void) {
        if (!eventName) {
            throw new Error("Event name is required");
        }
        if (eventName === "*") {
            this.wildcardEvents.push(callback as (data: any) => void);
        }
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback as (data: any) => void);
    }
}

export default SimpleEventBus;