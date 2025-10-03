import { logger } from "@/config";
import { EventBus } from "@/core/dependencies/events";


export const createSubscribers = (eventBus: EventBus) => {
    eventBus.on("*", (data, eventName) => {
        logger.warn(`Event received: ${eventName} ${JSON.stringify(data)}`);
    });
}