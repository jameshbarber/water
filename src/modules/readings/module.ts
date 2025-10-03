import Module, { ModuleConfig } from "@/core/modules";
import { Deps } from "@/deps";
import { ReadingRecord } from ".";
import { z } from "zod";

const readingsQuery = z.object({
    deviceId: z.string().optional(),
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
    bucket: z.union([z.literal("hour"), z.literal("day"), z.literal("week"), z.literal("month")]).optional(),
});

type ReadingsQuery = z.infer<typeof readingsQuery>;

class ReadingsModule extends Module<ReadingRecord> {
    constructor(config: ModuleConfig<ReadingRecord>, deps: Deps) {
        super(config, deps);

        this.addRoute({
            path: `/${this.name}`,
            method: "get",
            summary: "List readings with filters",
            description: "Supports deviceId, start, end, and bucket",
            inputSchemas: {
                query: readingsQuery as any
            },
            handler: async (req: any, res: any) => {
                const q = readingsQuery.parse(req.query ?? {});
                const items = await this.queryReadings(q);
                res.json(items);
            }
        });
    }

    private async queryReadings(q: ReadingsQuery): Promise<any[]> {
        const repo = this.deps.database.repo<ReadingRecord>(this.name);
        const all = await repo.findMany({ where: { deviceId: q.deviceId } as any });

        const start = q.start ? new Date(q.start).getTime() : undefined;
        const end = q.end ? new Date(q.end).getTime() : undefined;
        const filtered = all.filter(r => {
            const ts = new Date(r.timestamp).getTime();
            if (start && ts < start) return false;
            if (end && ts > end) return false;
            return true;
        });

        if (!q.bucket) return filtered;

        const bucketKey = (d: Date) => {
            const y = d.getUTCFullYear();
            const m = d.getUTCMonth() + 1;
            const day = d.getUTCDate();
            const hr = d.getUTCHours();
            switch (q.bucket) {
                case "hour": return `${y}-${m}-${day}T${hr}:00Z`;
                case "day": return `${y}-${m}-${day}`;
                case "week": {
                    const first = new Date(d);
                    const dayIdx = (d.getUTCDay() + 6) % 7; // ISO week start Monday
                    first.setUTCDate(d.getUTCDate() - dayIdx);
                    return `${first.getUTCFullYear()}-W${Math.ceil((first.getUTCDate())/7)}`;
                }
                case "month": return `${y}-${m}`;
            }
        };

        const groups = new Map<string, { t: string; count: number; min: number; max: number; avg: number; sum: number }>();
        for (const r of filtered) {
            const key = bucketKey(new Date(r.timestamp))!;
            const g = groups.get(key) ?? { t: key, count: 0, min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY, avg: 0, sum: 0 };
            g.count += 1;
            g.sum += Number(r.value);
            if (Number(r.value) < g.min) g.min = Number(r.value);
            if (Number(r.value) > g.max) g.max = Number(r.value);
            g.avg = g.sum / g.count;
            groups.set(key, g);
        }
        return Array.from(groups.values()).sort((a, b) => a.t.localeCompare(b.t));
    }
}

export default ReadingsModule;
