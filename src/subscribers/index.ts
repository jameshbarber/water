import { Deps } from "@/deps";
import { makeProcessReadings } from "@/modules/triggers/listeners";
import commandsModuleFactory from "@/modules/commands/factory";
import TriggerModule from "@/modules/triggers";

export const createSubscribers = (deps: Deps) => {
    const { eventBus, logger } = deps;
    eventBus.on("*", (data, eventName) => {
        logger.warn(`Event received: ${eventName} ${JSON.stringify(data)}`);
    });

    // On readings.created, fetch triggers and process
    eventBus.on("readings.created", async (reading) => {
        try {
            const triggersModule = new TriggerModule({ name: "triggers" }, deps);
            const deviceTriggers = await triggersModule.findMany({ deviceId: reading.deviceId });
            const processor = makeProcessReadings(() => commandsModuleFactory(deps, { name: "commands" }));
            for (const trigger of deviceTriggers) {
                await processor(trigger as any, [reading as any]);
            }
        } catch (err) {
            logger.error(`Failed processing triggers for reading: ${(err as Error).message}`);
        }
    });
}