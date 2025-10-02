import Module from "@/core/modules/module";
import { ModuleConfig } from "@/core/modules/module";
import { TriggerRecord } from "./schema";
import { ReadingRecord } from "../readings";
import { makeProcessReadings } from "./listeners";
import CommandsModule from "../commands";

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
            for (const trigger of triggers) {
                await makeProcessReadings(() => new CommandsModule({store: this.store, eventBus: this.eventBus, schema: this.schema, app: this.app}))(trigger, readings);
            }
        });
    }   

}

export default TriggerModule;       