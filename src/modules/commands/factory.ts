import { Deps } from "@/deps";
import CommandsModule from "./module";
import { commandSchemaProvider } from "./schema";

const commandsModuleFactory = (deps: Deps) => {
        return () => {
        const module = new CommandsModule({name: "commands", store: deps.db, eventBus: deps.eventBus, schema: commandSchemaProvider});
        return module;
    }
}

export default commandsModuleFactory;