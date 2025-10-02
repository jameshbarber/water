import Module from "@/core/modules/module";
import { ModuleConfig } from "@/core/modules/module";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { CommandRecord } from "./schema";

const execAsync = promisify(exec);

class CommandsModule extends Module<CommandRecord> {
    constructor(config: ModuleConfig<CommandRecord>) {
        super(config);
    }

    async runCommand(commandId: string) {
        const command = await this.findOne(commandId);
        return execAsync(command.command);
    }
}

export default CommandsModule;  