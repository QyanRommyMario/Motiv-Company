/**
 * Centralized Logging Utility
 * Provides structured logging with different levels
 */

const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.isProduction = process.env.NODE_ENV === "production";
  }

  /**
   * Format log message
   */
  formatMessage(level, message, data = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      env: process.env.NODE_ENV,
    };
  }

  /**
   * Sanitize sensitive data from logs
   */
  sanitize(data) {
    if (!data) return data;

    const sanitized = { ...data };
    const sensitiveKeys = [
      "password",
      "token",
      "secret",
      "apiKey",
      "creditCard",
      "cvv",
      "pin",
    ];

    const sanitizeObject = (obj) => {
      if (typeof obj !== "object" || obj === null) return obj;

      if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeObject(item));
      }

      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
          result[key] = "***REDACTED***";
        } else if (typeof value === "object") {
          result[key] = sanitizeObject(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    };

    return sanitizeObject(sanitized);
  }

  /**
   * Log error
   */
  error(message, error = null, data = {}) {
    const formatted = this.formatMessage(LOG_LEVELS.ERROR, message, {
      ...this.sanitize(data),
      error: error
        ? {
            message: error.message,
            stack: this.isDevelopment ? error.stack : undefined,
            code: error.code,
          }
        : undefined,
    });

    console.error("[ERROR]", formatted);

    // TODO: Send to error tracking service (Sentry)
    // if (this.isProduction && typeof Sentry !== 'undefined') {
    //   Sentry.captureException(error, { extra: data });
    // }
  }

  /**
   * Log warning
   */
  warn(message, data = {}) {
    const formatted = this.formatMessage(
      LOG_LEVELS.WARN,
      message,
      this.sanitize(data)
    );

    if (this.isDevelopment) {
      console.warn("[WARN]", formatted);
    }

    // TODO: Send to logging service
  }

  /**
   * Log info
   */
  info(message, data = {}) {
    const formatted = this.formatMessage(
      LOG_LEVELS.INFO,
      message,
      this.sanitize(data)
    );

    if (this.isDevelopment) {
      console.log("[INFO]", formatted);
    }

    // TODO: Send to logging service
  }

  /**
   * Log debug
   */
  debug(message, data = {}) {
    if (this.isDevelopment) {
      const formatted = this.formatMessage(
        LOG_LEVELS.DEBUG,
        message,
        this.sanitize(data)
      );
      console.debug("[DEBUG]", formatted);
    }
  }

  // ========================================
  // SPECIALIZED LOGGERS
  // ========================================

  /**
   * Log payment-related events
   */
  payment(action, data = {}) {
    const formatted = this.formatMessage("info", `[PAYMENT] ${action}`, {
      ...this.sanitize(data),
      timestamp: new Date().toISOString(),
    });

    console.log(formatted);

    // TODO: Send to payment audit log
  }

  /**
   * Log stock-related events
   */
  stock(action, data = {}) {
    const formatted = this.formatMessage("info", `[STOCK] ${action}`, {
      ...this.sanitize(data),
      timestamp: new Date().toISOString(),
    });

    console.log(formatted);

    // TODO: Send to inventory audit log
  }

  /**
   * Log security events
   */
  security(action, data = {}) {
    const formatted = this.formatMessage("warn", `[SECURITY] ${action}`, {
      ...this.sanitize(data),
      timestamp: new Date().toISOString(),
      ip: data.ip || "unknown",
    });

    console.warn(formatted);

    // TODO: Send to security monitoring service
    // Alert admin if critical security event
  }

  /**
   * Log authentication events
   */
  auth(action, data = {}) {
    const formatted = this.formatMessage("info", `[AUTH] ${action}`, {
      userId: data.userId,
      email: data.email,
      ip: data.ip,
      userAgent: data.userAgent,
      timestamp: new Date().toISOString(),
    });

    console.log(formatted);
  }

  /**
   * Log API requests
   */
  api(method, path, data = {}) {
    if (this.isDevelopment) {
      const formatted = this.formatMessage("info", `[API] ${method} ${path}`, {
        ...this.sanitize(data),
        duration: data.duration,
        status: data.status,
      });

      console.log(formatted);
    }
  }

  /**
   * Log database operations
   */
  db(operation, data = {}) {
    if (this.isDevelopment) {
      const formatted = this.formatMessage("info", `[DB] ${operation}`, {
        table: data.table,
        action: data.action,
        duration: data.duration,
      });

      console.log(formatted);
    }
  }

  /**
   * Log performance metrics
   */
  performance(metric, value, data = {}) {
    const formatted = this.formatMessage(
      "info",
      `[PERFORMANCE] ${metric}: ${value}ms`,
      data
    );

    if (this.isDevelopment || value > 1000) {
      // Log slow operations
      console.log(formatted);
    }

    // TODO: Send to performance monitoring
  }

  /**
   * Log business events
   */
  business(event, data = {}) {
    const formatted = this.formatMessage("info", `[BUSINESS] ${event}`, {
      ...this.sanitize(data),
      timestamp: new Date().toISOString(),
    });

    console.log(formatted);

    // TODO: Send to business analytics
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;
export { logger };

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Create API request logger middleware
 */
export function createAPILogger() {
  return async (request, response) => {
    const startTime = Date.now();
    const method = request.method;
    const path = request.url;

    try {
      // Log request
      logger.api(method, path, {
        headers: request.headers,
        query: request.query,
      });

      // Continue with request...

      // Log response
      const duration = Date.now() - startTime;
      logger.api(method, path, {
        duration,
        status: response?.status,
      });
    } catch (error) {
      logger.error(`API Error: ${method} ${path}`, error);
    }
  };
}

/**
 * Create performance timer
 */
export function createTimer(label) {
  const startTime = Date.now();

  return {
    end: () => {
      const duration = Date.now() - startTime;
      logger.performance(label, duration);
      return duration;
    },
  };
}

/**
 * Log with context
 */
export function logWithContext(level, message, context = {}) {
  const contextData = {
    ...context,
    timestamp: new Date().toISOString(),
  };

  switch (level) {
    case "error":
      logger.error(message, null, contextData);
      break;
    case "warn":
      logger.warn(message, contextData);
      break;
    case "info":
      logger.info(message, contextData);
      break;
    case "debug":
      logger.debug(message, contextData);
      break;
    default:
      logger.info(message, contextData);
  }
}
