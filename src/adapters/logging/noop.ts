import type { Logger, LogLevel } from "@/core/dependencies/logger";

export class NoopLogger implements Logger {
  setLevel(_level: LogLevel): void {}
  child(_context: Record<string, unknown>): Logger { return this; }
  debug(_message: string, ..._meta: any[]): void {}
  info(_message: string, ..._meta: any[]): void {}
  warn(_message: string, ..._meta: any[]): void {}
  error(_message: string, ..._meta: any[]): void {}
}


