import Module from "@/core/modules";
import { ModuleConfig } from "@/core/modules";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { CommandRecord } from "./schema";
import { Deps } from "@/deps";

const execAsync = promisify(exec);

class CommandsModule extends Module<CommandRecord> {
    constructor(config: ModuleConfig<CommandRecord>, deps: Deps) {
        super(config, deps);
    }

    async runCommand(commandId: string) {
        const command = await this.findOne(commandId);
        return execAsync(command.command);
    }
}

export default CommandsModule;  