import enhancedLogger from "../logger/enhanced logger.js";
import { withRequestContext } from "../logger/context logger.js";
import cryptoRandomString from "crypto-random-string";

export const requestLogger = async (req, res, next) => {

  // genarate time rwqurement for each request
  const start = Date.now();

  // genarate unique request id
  const orderId = cryptoRandomString({ length: 10, type: 'numeric' });
  req.requestId = orderId;

  withRequestContext(req, res, () => {
    res.on("finish", () => {
      const sid = res.locals.sessionId || "anonymous";
      const duration = Date.now() - start;

      if (res.statusCode < 400) {
        enhancedLogger.httpSuccess(sid, req.requestId, req.method, req.originalUrl, res.statusCode, { duration, req });
      } else {
        enhancedLogger.httpError(sid, req.requestId, req.method, req.originalUrl, res.statusCode, new Error("HTTP error"), { duration, req });
      }

      enhancedLogger.performance(`${sid} ${req.requestId} ${req.method} ${req.originalUrl}`, duration);
    });

    next();
  });
};