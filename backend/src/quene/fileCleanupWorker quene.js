// workers/fileCleanupWorker.js
import { Worker } from "bullmq";
import IORedis from "ioredis";
import fs from "fs/promises";
import logger from "../logger/log logger.js";

const connection = new IORedis({
  maxRetriesPerRequest: null,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  lazyConnect: true,
});

const fileCleanupWorker = new Worker(
  "fileCleanupQueue",
  async job => {
    const { filePath } = job.data;

    try {
      await fs.unlink(filePath);
      logger.info(`File cleanup successful: ${filePath}`);
    } catch (err) {
      logger.warn(`File cleanup failed for ${filePath}:`, err);
    }
  },
  { connection }
);

fileCleanupWorker.on("completed", job => {
  logger.info(`Cleanup job ${job.id} completed`);
});

fileCleanupWorker.on("failed", (job, err) => {
  logger.warn(`Cleanup job ${job?.id} failed:`, err);
});

export default fileCleanupWorker;
