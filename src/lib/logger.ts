/**
 * Production Structured Logger
 * Emits consistent JSON logs in production and clean console output in development.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
  timestamp: string;
}

function formatLog(level: LogLevel, message: string, context?: Record<string, any>, err?: unknown): LogPayload {
  let errorObj: LogPayload["error"];

  if (err instanceof Error) {
    errorObj = {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    };
  } else if (err) {
    errorObj = { message: String(err) };
  }

  return {
    level,
    message,
    context,
    error: errorObj,
    timestamp: new Date().toISOString(),
  };
}

export const logger = {
  debug(message: string, context?: Record<string, any>) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, context || "");
    }
  },

  info(message: string, context?: Record<string, any>) {
    const payload = formatLog("info", message, context);
    console.log(JSON.stringify(payload));
  },

  warn(message: string, context?: Record<string, any>) {
    const payload = formatLog("warn", message, context);
    console.warn(JSON.stringify(payload));
  },

  error(message: string, err?: unknown, context?: Record<string, any>) {
    const payload = formatLog("error", message, context, err);
    console.error(JSON.stringify(payload));
  },
};
