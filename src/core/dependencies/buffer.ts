export interface BufferService<T extends { id?: string } = any> {
    enqueue(bucket: string, item: T): void;
    flush(bucket: string): Promise<T[]>;
    setFlushHandler(bucket: string, handler: (items: T[]) => Promise<void>): void;
    start(bucket: string, intervalMs: number): void;
    stop(bucket: string): void;
    setThreshold?(bucket: string, maxItems: number): void;
}

