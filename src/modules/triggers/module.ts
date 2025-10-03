import Module from "@/core/modules";
import { ModuleConfig } from "@/core/modules";
import { TriggerRecord } from "./schema";
import { ReadingRecord } from "@/modules/readings";
import { makeProcessReadings } from "./listeners";
import commandsModuleFactory from "@/modules/commands/factory";
import AppError from "@/core/error";

class TriggerModule extends Module<TriggerRecord> {
    constructor(config: ModuleConfig<TriggerRecord>) {
        super(config);
    }

    async createTrigger(trigger: TriggerRecord) {
        return this.create(trigger);
    }

    async getTrigger(id: string) {
        return this.findOne(id);
    }

    async getTriggersForEvent(event: string) {
        return this.findMany({ event });
    }

    async registerListeners() {
        this.eventBus.on("readings.created", async (readings: ReadingRecord[]) => {
            const triggers = await this.findMany({ event: "readings.created"});
            if (!this.app?.deps) {
                throw new AppError("App dependencies not found");
            }
            for (const trigger of triggers) {
                await makeProcessReadings(commandsModuleFactory(this.app.deps))(trigger, readings);
            }
        });
    }   

}

export default TriggerModule;       