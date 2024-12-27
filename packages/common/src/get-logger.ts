import { BaseLogger, pino } from 'pino';

let logger: BaseLogger;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
if (!logger) {
  /*
   * One of 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'.
   * @see https://github.com/pinojs/pino/blob/master/docs/api.md#level-string
   */
  const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

  logger = pino({
    level: LOG_LEVEL,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  });
}

export { logger };
