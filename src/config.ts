import "dotenv/config";
import { AppManifest } from "./core/app";
import CommandsModule, { commandSchemaProvider } from "./modules/commands";
import DevicesModule, { deviceSchemaProvider } from "./modules/devices";
import { triggerSchemaProvider } from "./modules/triggers";

const manifest: AppManifest = {
    "name": "water",
    "version": "1.0.0",
    "interfaces": {
        "mcp": {
            "enabled": false,
        },
        "rest": {
            "enabled": true,
            "port": 4000,
            "host": "0.0.0.0"
        }
    },
    "store": {
        "type": "json", 
        "url": "data.json"
    },
    "modules": {
        "commands": {
            "name": "commands",
            "schema": commandSchemaProvider,
            "constructor": CommandsModule
        },
        "devices": {
            "name": "devices",
            "schema": deviceSchemaProvider,
            "constructor": DevicesModule
        },
        "triggers": {
            "name": "triggers",
            "schema": triggerSchemaProvider
        }
    }
}

export default manifest;