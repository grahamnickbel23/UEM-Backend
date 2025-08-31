import { AsyncLocalStorage } from "async_hooks";

export const requestContext = new AsyncLocalStorage();

// middleware for HTTP requests
export function withRequestContext(req, res, next) {
  const context = { requestId: req.requestId, type: "http" };
  requestContext.run(context, () => next());
}

// manual context setter for jobs / internal tasks
export function setContext(context) {
  return requestContext.run(context, () => {});
}

// get current context anywhere (for logger)
export function getContext() {
  return requestContext.getStore();
}