import Module, { ModuleConfig } from "@/core/modules";
import { Deps } from "@/deps";
import { JsonSettingsStore } from "@/adapters/settings/file";

type KV = { id: string, value: string };

class SettingsModule extends Module<KV> {
    private store: JsonSettingsStore;

    constructor(config: ModuleConfig<KV>, deps: Deps) {
        super(config, deps);
        this.store = new JsonSettingsStore("db/settings.json");

        this.addRoute({
            path: "/settings",
            method: "get",
            summary: "Get settings",
            description: "Return all settings from file store",
            handler: async (_req: any, res: any) => {
                return res.json(this.store.getAll());
            },
        });
        this.addRoute({
            path: "/settings",
            method: "put",
            summary: "Update settings",
            description: "Merge and persist settings to file store",
            handler: async (req: any, res: any) => {
                const next = this.store.setAll(req.body ?? {});
                return res.json(next);
            },
        });
        this.addRoute({
            path: "/manifest",
            method: "get",
            summary: "Get manifest",
            description: "Return the mutable manifest from settings store",
            handler: async (_req: any, res: any) => {
                return res.json(this.store.getManifest());
            },
        });
        this.addRoute({
            path: "/manifest",
            method: "put",
            summary: "Update manifest",
            description: "Persist manifest to settings store",
            handler: async (req: any, res: any) => {
                const next = this.store.setManifest(req.body ?? {});
                return res.json(next);
            },
        });
    }
}

export default SettingsModule;

