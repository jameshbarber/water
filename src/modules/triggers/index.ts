import Module from "@/core/modules/module";
import { ModuleConfig } from "@/core/modules/module";
import { TriggerRecord } from "./schema";

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

}

export default TriggerModule;       