import { Logger, LogLevel } from "@/core/dependencies/logger";
import { nowIso, shouldLog, ConsoleLogger } from "@/adapters/logging/console";
// Avoid importing ESM-only chalk in tests; lazy-load to limit impact
let chalk: any;
function getChalk() {
  if (!chalk) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      chalk = require("chalk");
    } catch {
      chalk = {
        gray: (s: string) => s,
        blue: (s: string) => s,
        yellow: (s: string) => s,
        red: (s: string) => s,
      };
    }
  }
  return chalk;
}

export class RichLogger extends ConsoleLogger {

  constructor(level: LogLevel = 'info', context: Record<string, unknown> = {}) {
    super(level, context);
  }

  setLevel(level: LogLevel): void {
    super.setLevel(level);
  }

  child(context: Record<string, unknown>): Logger {
    return new RichLogger(this.level, { ...this.context, ...context });
  }

  private formatLevel(level: LogLevel): string {
    const c = getChalk();
    const levels = {
      debug: c.gray('DEBUG'),
      info: c.blue('INFO '),
      warn: c.yellow('WARN '),
      error: c.red('ERROR')
    };
    return levels[level];
  }

  private formatMeta(meta: any[]): string {
    if (!meta.length) return '';
    const formatted = meta.length === 1 ? meta[0] : meta;
    const c = getChalk();
    return c.gray(`\n${JSON.stringify(formatted, null, 2)}`);
  }

  private formatContext(): string {
    if (!Object.keys(this.context).length) return '';
    const c = getChalk();
    return c.gray(` ${JSON.stringify(this.context)}`);
  }

  protected format(level: LogLevel, message: string, meta: any[]): string {
    const c = getChalk();
    return [
      c.gray(nowIso()),
      this.formatLevel(level),
      message,
      this.formatContext(),
      this.formatMeta(meta)
    ].join(' ');
  }

  debug(message: string, ...meta: any[]): void {
    if (!shouldLog(this.level, 'debug')) return;
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
