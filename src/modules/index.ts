import { createDeps } from "@/deps";
import manifest from "@/config";
import CommandsModule from "@/modules/commands";
import { commandSchemaProvider } from "@/modules/commands/schema";
import TriggersModule from "@/modules/triggers";
import { triggerSchemaProvider } from "@/modules/triggers/schema";
import DevicesModule from "./devices/module";
import { deviceSchemaProvider } from "./devices/schema";
import { makeDriver } from "@/test/mocks";


const deps = createDeps(manifest);


const makeCommandsModule = () =>
    new CommandsModule({
        name: "commands",
        store: deps.db,
        eventBus: deps.eventBus,
        schema: commandSchemaProvider,
        logger: deps.logger,
    });

const makeTriggersModule = () =>
    new TriggersModule({
        name: "triggers",
        store: deps.db,
        eventBus: deps.eventBus,
        schema: triggerSchemaProvider,
        logger: deps.logger,
    });



const makeDevicesModule = () =>
    new DevicesModule({
        logger: deps.logger,
        name: "devices",
        store: deps.db,
        eventBus: deps.eventBus,
        schema: deviceSchemaProvider,
    }, makeDriver());


export { makeCommandsModule, makeTriggersModule, makeDevicesModule };