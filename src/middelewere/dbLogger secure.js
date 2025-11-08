import enhancedLogger from "../logger/enhanced logger.js";
import { requestContext } from "../logger/context logger.js";

export default function dbLogger(schema, options) {
  schema.pre(/^find/, function (next) {
    this._startTime = Date.now();
    next();
  });

  schema.post(/^find/, function (docs, next) {
    const duration = Date.now() - this._startTime;
    const ctx = requestContext.getStore();
    const requestId = ctx?.requestId || "NO-REQ"; // fallback if called outside HTTP flow

    enhancedLogger.dbSuccess("find", this.constructor.modelName, { requestId, duration, docsCount: docs.length });
    enhancedLogger.performance(`${requestId} find ${this.constructor.modelName}`, duration);
    next();
  });

  schema.post(/^find/, function (error, doc, next) {
    const ctx = requestContext.getStore();
    const requestId = ctx?.requestId || "NO-REQ";

    enhancedLogger.dbError("find", this.constructor.modelName, error, { requestId });
    next(error);
  });
}
