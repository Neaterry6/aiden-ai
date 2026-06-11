export type LogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error";

export class Logger {
  private timestamp(): string {
    return new Date().toISOString();
  }

  debug(...args: unknown[]): void {
    console.debug(
      `[${this.timestamp()}] [DEBUG]`,
      ...args
    );
  }

  info(...args: unknown[]): void {
    console.info(
      `[${this.timestamp()}] [INFO]`,
      ...args
    );
  }

  warn(...args: unknown[]): void {
    console.warn(
      `[${this.timestamp()}] [WARN]`,
      ...args
    );
  }

  error(...args: unknown[]): void {
    console.error(
      `[${this.timestamp()}] [ERROR]`,
      ...args
    );
  }
}

export const logger = new Logger();

export default logger;
