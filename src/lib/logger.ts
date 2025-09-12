type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const DEFAULT_REDACTIONS: Array<RegExp> = [
  /bearer\s+[a-z0-9._-]+/gi,
  /api[_-]?key\s*[:=]\s*[a-z0-9-_]{10,}/gi,
  /password\s*[:=]\s*[^\s"']+/gi,
  /secret\s*[:=]\s*[^\s"']+/gi,
  /access[_-]?token\s*[:=]\s*[a-z0-9._-]+/gi,
  /refresh[_-]?token\s*[:=]\s*[a-z0-9._-]+/gi,
  /authorization:\s*[^\n\r]+/gi,
  /set-cookie:[^\n\r]+/gi,
];

function scrubPII(input: unknown, extraRedactions: Array<RegExp> = []): unknown {
  const redactions = [...DEFAULT_REDACTIONS, ...extraRedactions];

  try {
    const json = JSON.stringify(input, (_key, value) => {
      if (typeof value === 'string') {
        let scrubbed = value;
        for (const pattern of redactions) {
          scrubbed = scrubbed.replace(pattern, '[REDACTED]');
        }
        return scrubbed;
      }
      return value;
    });
    return JSON.parse(json);
  } catch {
    if (typeof input === 'string') {
      let scrubbed = input;
      for (const pattern of redactions) {
        scrubbed = scrubbed.replace(pattern, '[REDACTED]');
      }
      return scrubbed;
    }
    return input;
  }
}

function formatMessage(message: unknown): string {
  if (message instanceof Error) return message.message;
  if (typeof message === 'string') return message;
  try {
    return JSON.stringify(message);
  } catch {
    return String(message);
  }
}

export interface LoggerOptions {
  level?: LogLevel;
  enableConsole?: boolean;
  redactions?: Array<RegExp>;
}

class Logger {
  private level: LogLevel;
  private enableConsole: boolean;
  private redactions: Array<RegExp>;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? (import.meta.env.DEV ? 'debug' : 'info');
    this.enableConsole = options.enableConsole ?? import.meta.env.DEV;
    this.redactions = options.redactions ?? [];
  }

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const order: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
    return order[level] >= order[this.level];
  }

  private emit(level: LogLevel, message: unknown, meta?: unknown) {
    if (!this.shouldLog(level)) return;
    const safeMessage = scrubPII(formatMessage(message), this.redactions);
    const safeMeta = meta === undefined ? undefined : scrubPII(meta, this.redactions);

    if (this.enableConsole) {
      const ts = new Date().toISOString();
      const line = `[${ts}] ${level.toUpperCase()}: ${safeMessage}`;
      switch (level) {
        case 'debug': console.debug(line, safeMeta); break;
        case 'info': console.info(line, safeMeta); break;
        case 'warn': console.warn(line, safeMeta); break;
        case 'error': console.error(line, safeMeta); break;
      }
    }

    // Datadog forward if available
    try {
      // @ts-ignore - optional global
      const DD_LOGS = (window as any).DD_LOGS || undefined;
      if (DD_LOGS && typeof DD_LOGS.logger?.log === 'function') {
        DD_LOGS.logger.log(String(safeMessage), { level, ...(safeMeta as object) });
      }
    } catch {
      // noop
    }
  }

  debug(message: unknown, meta?: unknown) { this.emit('debug', message, meta); }
  info(message: unknown, meta?: unknown) { this.emit('info', message, meta); }
  warn(message: unknown, meta?: unknown) { this.emit('warn', message, meta); }
  error(message: unknown, meta?: unknown) { this.emit('error', message, meta); }
}

export const logger = new Logger();
export { scrubPII };



