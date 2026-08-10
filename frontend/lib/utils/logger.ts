type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  userId?: string;
  requestId?: string;
  errorId?: string;
  [key: string]: any;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const isProduction = process.env.NODE_ENV === 'production';
    const timestamp = new Date().toISOString();

    if (isProduction) {
      // Structured JSON logging for production
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...context
      });
    }

    // Pretty console logging for development
    const ctxStr = context ? `\nContext: ${JSON.stringify(context, null, 2)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctxStr}`;
  }

  info(message: string, context?: LogContext) {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error, context?: LogContext) {
    const errorContext = {
      ...context,
      errorId: context?.errorId || crypto.randomUUID(),
      stack: error?.stack,
      errorMessage: error?.message
    };
    console.error(this.formatMessage('error', message, errorContext));
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }
}

export const logger = new Logger();
