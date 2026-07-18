/* eslint-disable no-console */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const isDev = import.meta.env.VITE_APP_ENV !== 'production';

function format(level: LogLevel, scope: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] [${scope}] ${message}`;
}

export const logger = {
  info(scope: string, message: string, ...meta: unknown[]): void {
    if (isDev) console.info(format('info', scope, message), ...meta);
  },
  warn(scope: string, message: string, ...meta: unknown[]): void {
    console.warn(format('warn', scope, message), ...meta);
  },
  error(scope: string, message: string, ...meta: unknown[]): void {
    console.error(format('error', scope, message), ...meta);
  },
  debug(scope: string, message: string, ...meta: unknown[]): void {
    if (isDev) console.debug(format('debug', scope, message), ...meta);
  },
};
