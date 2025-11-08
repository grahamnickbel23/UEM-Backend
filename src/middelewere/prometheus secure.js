import client from 'prom-client';

// ---- registry ----
export const register = new client.Registry();

// Collect default Node.js metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({ register });

// ---- custom metrics ----
const requestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// ---- middleware ----
export default function prometheusMiddleware(req, res, next) {
  const route = req.route?.path || req.path; // avoid dynamic param explosion
  res.on('finish', () => {
    requestCounter.labels(req.method, route, res.statusCode).inc();
  });
  next();
}
