import Module from "@/core/modules";
import { ModuleConfig } from "@/core/modules";
import { TriggerRecord } from "./schema";
import { ReadingRecord } from "@/modules/readings";
import { makeProcessReadings } from "./listeners";
import commandsModuleFactory from "@/modules/commands/factory";
import { Deps } from "@/deps";

class TriggerModule extends Module<TriggerRecord> {
    constructor(config: ModuleConfig<TriggerRecord>, deps: Deps) {
        super(config, deps);
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

    // async registerListeners() {
    //     this.deps.eventBus.on("readings.created", async (readings: ReadingRecord[]) => {
    //         const triggers = await this.findMany({ event: "readings.created"});
    //         for (const trigger of triggers) {
    //             await makeProcessReadings(commandsModuleFactory(this.deps, { name: "commands", store: this.deps.database.repo<CommandRecord>("commands"), eventBus: this.deps.eventBus, schema: commandSchemaProvider }))(trigger, readings);
    //         }
    //     });
    // }   

}

export default TriggerModule;       