import logger from "./log logger.js";

// Enhanced logger with predefined methods for common operations
const enhancedLogger = {
    // Basic logging methods
    fatal: (message, meta = {}) => logger.fatal(message, meta),
    error: (message, meta = {}) => logger.error(message, meta),
    warn: (message, meta = {}) => logger.warn(message, meta),
    info: (message, meta = {}) => logger.info(message, meta),
    audit: (message, meta = {}) => logger.audit(message, meta),

    // HTTP request logging
    httpSuccess: (requestId, method, endpoint, statusCode = 200, additionalInfo = {}) => {
        logger.info(`${requestId} ${method.toUpperCase()} ${endpoint} - SUCCESS (${statusCode})`, additionalInfo);
    },

    httpError: (requestId, method, endpoint, statusCode, error, additionalInfo = {}) => {
        logger.error(`${requestId} ${method.toUpperCase()} ${endpoint} - ERROR (${statusCode})`, { 
            error: error.message || error, 
            stack: error.stack,
            ...additionalInfo 
        });
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
        logger.audit(
            `${requestId},
            AUTH SUCCESS - User: ${userId}, 
            Action: ${action}, 
            ${additionalInfo}`
        );
    },

    authFailure: (requestId, trigger, userId, action, reason, additionalInfo = {}) => {
    if (trigger) {
        logger.warn(
            `${requestId} 
            AUTH FAILURE - User: ${userId}, 
            Action: ${action}, 
            Reason: ${reason},
            ${additionalInfo}`
        );
    }
},


    // Application lifecycle
    appStart: (port, environment = 'development') => {
        logger.info(
            `APPLICATION STARTED on port ${port} in ${environment} mode`);
    },

    appShutdown: (reason = 'Manual shutdown') => {
        logger.info(`APPLICATION SHUTDOWN - Reason: ${reason}`);
    },

    // Performance logging
    performance: (operation, duration, additionalInfo = {}) => {
        const level = duration > 1000 ? 'warn' : 'info';
        logger[level](`PERFORMANCE - ${operation} completed in ${duration}ms`, additionalInfo);
    },

    // Raw winston logger access for advanced usage
    raw: logger
};

export default enhancedLogger;