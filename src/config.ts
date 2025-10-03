import "dotenv/config";
import { AppManifest } from "./core/app";

// Module imports
import CommandsModule, { commandSchemaProvider } from "./modules/commands";
import DevicesModule, { deviceSchemaProvider } from "./modules/devices";
import { triggerSchemaProvider } from "./modules/triggers";
import { readingsSchemaProvider } from "./modules/readings";
import SettingsModule from "./modules/settings/module";

const manifest: AppManifest = {
    "name": "water",
    "version": "1.0.0",
    "interfaces": {
        "mcp": {
            "enabled": true,
        },
        "rest": {
            "enabled": true,
            "port": 4000,
            "host": "192.168.1.50"
        }
    },
    "store": {
        "type": "json", 
        "url": "db/data.json"
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
        }, 
        "readings": {
            "name": "readings",
            "schema": readingsSchemaProvider
        },
        "settings": {
            "name": "settings",
            "constructor": SettingsModule
        }
    }
}

export default manifest;