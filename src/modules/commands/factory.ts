import { Deps } from "@/deps";
import CommandsModule from "./module";
import { CommandRecord } from "./schema";
import { ModuleConfig } from "@/core/modules";

const commandsModuleFactory = (deps: Deps, config: ModuleConfig<CommandRecord>) => {
    return new CommandsModule(config, deps);
}

export default commandsModuleFactory;