// queues/emailQueue.js
import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis();

// quene for email process
export const emailQueue = new Queue("emailQueue", { connection });

// quene for corn jobs
export const cornQuene = new Queue("cornQuene", { connection });

// quene for deleting files
export const fileCleanupQueue = new Queue("fileCleanupQueue", { connection });