import Module from "@/core/modules/module";
import { ModuleConfig } from "@/core/modules/module";
import { CommandRecord } from "./schema";

class CommandsModule extends Module<CommandRecord> {
    constructor(config: ModuleConfig<CommandRecord>) {
        super(config);
    }
}

export default CommandsModule;  