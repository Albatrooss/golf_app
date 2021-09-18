import pino from 'pino';
import env from './env';

// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
// https://github.com/pinojs/pino/blob/master/docs/help.md#mapping-pino-log-levels-to-google-cloud-logging-stackdriver-serverity-levels
const PinoLevelToSeverityLookup = {
  trace: 'DEBUG',
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL',
} as Record<string, string>;

const gcpFormatters = {
  level: (label: string, number: number) => ({
    level: number,
    severity:
      PinoLevelToSeverityLookup[label] || PinoLevelToSeverityLookup.info,
  }),
  log: (message: Record<string, any>) => ({ message }),
};

const logger = pino({
  formatters: env.NODE_ENV === 'production' ? gcpFormatters : {},
  prettyPrint: env.NODE_ENV === 'development',
  messageKey: 'message',
  level: env.getOptional('LOG_LEVEL', 'debug'),
});

export default logger;
