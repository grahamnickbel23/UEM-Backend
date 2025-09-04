import { Worker } from "bullmq";
import IORedis from "ioredis";
import garbageCollector from "../controller/garbageCollector logic.js";
import logger from "../logger/log logger.js";

// Configure Redis connection for BullMQ
const connection = new IORedis({
    maxRetriesPerRequest: null, // This is required for BullMQ
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    lazyConnect: true,
});

const cornWorker = new Worker(
    "cornQuene",
    async job => {
        switch (job.name){
            case "deletedAccount":
                return await garbageCollector.deleteAccounts();
            
            case "deletedDoc":
                return await garbageCollector.deleteDocs();
            
            case "deleteLogs":
                return await garbageCollector.deleteLogs();
        }
    },
    { connection }
);

cornWorker.on("completed", job => {
    logger.info(`${job.data.id} corn job ${job.id} of type ${job.name} completed`)
});

cornWorker.on("failed", (job, err) => {
    logger.error(`${job.data.id} corn job ${job?.id} of type ${job?.name} failed:`, err);
});


export default cornWorker;