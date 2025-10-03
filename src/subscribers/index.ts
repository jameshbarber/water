import { Deps } from "@/deps";

export const createSubscribers = (deps: Deps) => {
    const { eventBus, logger } = deps;
    eventBus.on("*", (data, eventName) => {
        logger.warn(`Event received: ${eventName} ${JSON.stringify(data)}`);
    });
}