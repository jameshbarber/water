import type { Logger, LogLevel } from "@/core/dependencies/logger";

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export function shouldLog(current: LogLevel, incoming: LogLevel) {
  return levelOrder[incoming] >= levelOrder[current];
}

export function nowIso() {
  return new Date().toISOString();
}

export class ConsoleLogger implements Logger {
  protected level: LogLevel;
  protected context: Record<string, unknown>;

  constructor(level: LogLevel = 'info', context: Record<string, unknown> = {}) {
    this.level = level;
    this.context = context;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  child(context: Record<string, unknown>): Logger {
    return new ConsoleLogger(this.level, { ...this.context, ...context });
  }

  protected format(level: LogLevel, message: string, meta: any[]): string {
    const base = { ts: nowIso(), level, msg: message, ...this.context } as Record<string, unknown>;
    if (meta && meta.length) base.meta = meta.length === 1 ? meta[0] : meta;
    return JSON.stringify(base);
  }

  debug(message: string, ...meta: any[]): void {
    if (!shouldLog(this.level, 'debug')) return;
    // console.debug is fine; keeps parity with node semantics
    console.debug(this.format('debug', message, meta));
  }

  info(message: string, ...meta: any[]): void {
    if (!shouldLog(this.level, 'info')) return;
    console.info(this.format('info', message, meta));
  }

  warn(message: string, ...meta: any[]): void {
    if (!shouldLog(this.level, 'warn')) return;
    console.warn(this.format('warn', message, meta));
  }

  error(message: string, ...meta: any[]): void {
    if (!shouldLog(this.level, 'error')) return;
    console.error(this.format('error', message, meta));
  }
}


