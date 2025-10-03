type Timer = ReturnType<typeof setInterval> | undefined;

export class InMemoryBufferService<T extends { id?: string } = any> {
    private buffers: Map<string, T[]> = new Map();
    private handlers: Map<string, (items: T[]) => Promise<void>> = new Map();
    private timers: Map<string, Timer> = new Map();
    private thresholds: Map<string, number> = new Map();

    enqueue(bucket: string, item: T): void {
        const buf = this.buffers.get(bucket) ?? [];
        buf.push(item);
        this.buffers.set(bucket, buf);
        const max = this.thresholds.get(bucket);
        if (typeof max === "number" && buf.length >= max) {
            void this.flush(bucket);
        }
    }

    async flush(bucket: string): Promise<T[]> {
        const items = this.buffers.get(bucket) ?? [];
        if (items.length === 0) return [];
        this.buffers.set(bucket, []);
        const handler = this.handlers.get(bucket);
        if (handler) await handler(items);
        return items;
    }

    setFlushHandler(bucket: string, handler: (items: T[]) => Promise<void>): void {
        this.handlers.set(bucket, handler);
    }

    start(bucket: string, intervalMs: number): void {
        this.stop(bucket);
        const t = setInterval(() => {
            void this.flush(bucket);
        }, intervalMs);
        if ((t as any)?.unref) (t as any).unref();
        this.timers.set(bucket, t);
    }

    stop(bucket: string): void {
        const t = this.timers.get(bucket);
        if (t) clearInterval(t as any);
        this.timers.delete(bucket);
    }

    setThreshold(bucket: string, maxItems: number): void {
        if (maxItems > 0) this.thresholds.set(bucket, maxItems);
        else this.thresholds.delete(bucket);
    }
}

export type BufferService<T extends { id?: string } = any> = InMemoryBufferService<T>;

