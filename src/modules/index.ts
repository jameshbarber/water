import { createDeps } from "@/deps";
import manifest from "@/config/manifest";
import CommandsModule from "@/modules/commands";
import { commandSchemaProvider } from "@/modules/commands/schema";
import TriggersModule from "@/modules/triggers";
import { triggerSchemaProvider } from "@/modules/triggers/schema";
import DevicesModule from "./devices/module";
import { deviceSchemaProvider } from "./devices/schema";
import { makeControlProtocol } from "@/test/mocks";


const deps = createDeps(manifest);


const makeCommandsModule = () =>
    new CommandsModule({
        name: "commands",
        store: deps.db,
        eventBus: deps.eventBus,
        schema: commandSchemaProvider,
    });

const makeTriggersModule = () =>
    new TriggersModule({
        name: "triggers",
        store: deps.db,
        eventBus: deps.eventBus,
        schema: triggerSchemaProvider,
    });



const makeDevicesModule = () =>
    new DevicesModule({
        name: "devices",
        store: deps.db,
        eventBus: deps.eventBus,
        schema: deviceSchemaProvider,
    }, makeControlProtocol());


export { makeCommandsModule, makeTriggersModule, makeDevicesModule };