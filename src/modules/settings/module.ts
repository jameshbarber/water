import Module, { ModuleConfig } from "@/core/modules";
import { Deps } from "@/deps";
import { InMemorySettingsStore } from "@/adapters/settings/file";

type KV = { id: string, value: string };

class SettingsModule extends Module<KV> {
    private store: InMemorySettingsStore;

    constructor(config: ModuleConfig<KV>, deps: Deps) {
        super(config, deps);
        this.store = new InMemorySettingsStore();

        this.addRoute({
            path: "/settings",
            method: "get",
            summary: "Get settings",
            description: "Return all settings",
            handler: async (_req: any, res: any) => {
                return res.json(this.store.getAll());
            },
        });
        this.addRoute({
            path: "/settings",
            method: "put",
            summary: "Update settings",
            description: "Merge and persist settings",
            handler: async (req: any, res: any) => {
                const next = this.store.setAll(req.body ?? {});
                return res.json(next);
            },
        });
        this.addRoute({
            path: "/manifest",
            method: "get",
            summary: "Get manifest",
            description: "Return the mutable manifest",
            handler: async (_req: any, res: any) => {
                return res.json(this.store.getManifest());
            },
        });
        this.addRoute({
            path: "/manifest",
            method: "put",
            summary: "Update manifest",
            description: "Persist manifest",
            handler: async (req: any, res: any) => {
                const next = this.store.setManifest(req.body ?? {});
                this.deps.eventBus.emit("settings.manifest.updated", next);
                return res.json(next);
            },
        });
    }
}

export default SettingsModule;

