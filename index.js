import dotenv from 'dotenv'
dotenv.config();

import express from 'express'
import cookieParser from 'cookie-parser';
import cron from "node-cron";
import cryptoRandomString from 'crypto-random-string';
import mongoDBConnect from './connectMongoDB.js';
import jwtPerser from './src/middelewere/jwtPerser secure.js'
import apiKey from './src/middelewere/apiKey secure.js';
import prometheusMiddleware, { register } from './src/middelewere/prometheus secure.js';
import { requestLogger } from './src/middelewere/requestLogger secure.js';
import { connectRedis } from './connectRedis.js';
import logger from './src/logger/log logger.js';
import authRoute from './src/routes/auth route.js';
import achivementRoute from './src/routes/achivement route.js';
import enhancedLogger from './src/logger/enhanced logger.js';
import { setContext } from "./src/logger/context logger.js";
import garbageCollector from './src/controller/garbageCollector logic.js';

const app = express();

// basic json perser + cookie perser + apiKey + logger + jwt perser
app.use(express.json());
app.use(cookieParser());
//app.use(apiKey);
app.use(requestLogger);
app.use(prometheusMiddleware);
app.use("/auth/edit", jwtPerser.jwtWrapper("access_token", "info"));
app.use("/achivement", jwtPerser.jwtWrapper("access_token", "info"));

// load from env
const PORT = process.env.PORT;

// connect db
connectRedis();
mongoDBConnect();

// api path
app.use("/auth", authRoute);
app.use('/achivement', achivementRoute);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// basic api path
app.get("/home", (req, res) => {
    logger.warn('1st comprehensive logging system implementation')
    return res.status(200).json({
        success: true,
        message: `let's deply the backend`
    })
})

// run once every hour (at minute 0)
cron.schedule("0 * * * *", async () => {

    const jobId = await cryptoRandomString({length: 10, type: 'numeric'});

    // set context here
    setContext({ requestId: jobId, type: "job", jobName: "garbage-collector" });

    logger.info(`${jobId} Running garbage collector...`);
    await garbageCollector.deleteAccounts();
    await garbageCollector.deleteDocs();
});

// ---- Server Startup ----
app.listen(PORT, () => {
    enhancedLogger.appStart(`Server is running on port: ${PORT}`);
});

// ---- Graceful Shutdown ----
process.on("SIGINT", async () => {
    enhancedLogger.appShutdown("SIGINT received (manual stop with Ctrl+C)");
    await cleanUp();  // e.g. close DB, Redis, flush logs
    process.exit(0);
});

// ---- Sudden Shutdown ----
process.on("SIGTERM", async () => {
    enhancedLogger.appShutdown("SIGTERM received (system stop / Docker kill)");
    await cleanUp();
    process.exit(0);
});