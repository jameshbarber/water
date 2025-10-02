type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const logLevels: Record<LogLevel, number> = {
  'debug': 0,
  'info': 1, 
  'warn': 2,
  'error': 3
};

let currentLogLevel: LogLevel = 'info';

const formatMessage = (level: LogLevel, message: string, ...args: any[]) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] ${level.toUpperCase()}: ${message} ${args.length ? JSON.stringify(args) : ''}`;
};

export const setLogLevel = (level: LogLevel) => {
  currentLogLevel = level;
};

export const log = {
  debug: (message: string, ...args: any[]) => {
    if (logLevels[currentLogLevel] <= logLevels['debug']) {
      console.debug(formatMessage('debug', message, ...args));
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (logLevels[currentLogLevel] <= logLevels['info']) {
      console.info(formatMessage('info', message, ...args));
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (logLevels[currentLogLevel] <= logLevels['warn']) {
      console.warn(formatMessage('warn', message, ...args));
    }
  },

  error: (message: string, ...args: any[]) => {
    if (logLevels[currentLogLevel] <= logLevels['error']) {
      console.error(formatMessage('error', message, ...args));
    }
  }
};
