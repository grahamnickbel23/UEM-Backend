import logger from "./log logger.js";

const enhancedLogger = {
    // Basic logging methods
    fatal: (message, meta = {}) => logger.fatal(message, meta),
    error: (message, meta = {}) => logger.error(message, meta),
    warn: (message, meta = {}) => logger.warn(message, meta),
    info: (message, meta = {}) => logger.info(message, meta),
    audit: (message, meta = {}) => logger.audit(message, meta),

    // HTTP request logging (structured JSON)
    httpSuccess: (sessionId, requestId, method, endpoint, statusCode = 200, { duration = 0, req } = {}) => {
        const now = new Date();

        const logEntry = {
            id: requestId,
            sessionId: sessionId || "anonymous",
            ip: req?.ip || req?.headers["x-forwarded-for"] || "unknown",
            target: `${method.toUpperCase()} ${endpoint}`,
            time: `${duration}ms`,
            success: true,
            date: now.toISOString().split("T")[0],
            clock: now.toTimeString().split(" ")[0],
            status: statusCode
        };

        // log as JSON
        logger.info(logEntry);
    },

    httpError: (sessionId, requestId, method, endpoint, statusCode = 500, error = {}, { duration = 0, req } = {}) => {
        const now = new Date();

        const logEntry = {
            id: requestId,
            sessionId: sessionId || "anonymous",
            ip: req?.ip || req?.headers["x-forwarded-for"] || "unknown",
            target: `${method.toUpperCase()} ${endpoint}`,
            time: `${duration}ms`,
            success: false,
            date: now.toISOString().split("T")[0],
            clock: now.toTimeString().split(" ")[0],
            status: statusCode,
            error: error?.message || "HTTP Error"
        };

        logger.error(logEntry);
    },

    // Database operations
    dbSuccess: (operation, table, additionalInfo = {}) => {
        logger.info(`DB ${operation.toUpperCase()} on ${table} - SUCCESS`, additionalInfo);
    },

    dbError: (operation, table, error, additionalInfo = {}) => {
        logger.error(`DB ${operation.toUpperCase()} on ${table} - ERROR`, { 
            error: error.message || error, 
            stack: error.stack,
            ...additionalInfo 
        });
    },

    // Authentication logging
    authSuccess: (requestId, userId, action, additionalInfo = {}) => {
        logger.audit({
            event: "AUTH_SUCCESS",
            requestId,
            userId,
            action,
            ...additionalInfo
        });
    },

    authFailure: (requestId, trigger, userId, action, reason, additionalInfo = {}) => {
        if (trigger) {
            logger.warn({
                event: "AUTH_FAILURE",
                requestId,
                userId,
                action,
                reason,
                ...additionalInfo
            });
        }
    },

    // Application lifecycle
    appStart: (port, environment = 'development') => {
        logger.info(`APPLICATION STARTED on port ${port} in ${environment} mode`);
    },

    appShutdown: (reason = 'Manual shutdown') => {
        logger.info(`APPLICATION SHUTDOWN - Reason: ${reason}`);
    },

    // Performance logging
    performance: (operation, duration, additionalInfo = {}) => {
        const level = duration > 1000 ? 'warn' : 'info';
        logger[level](`PERFORMANCE - ${operation} completed in ${duration}ms`, additionalInfo);
    },

    raw: logger
};

export default enhancedLogger;
