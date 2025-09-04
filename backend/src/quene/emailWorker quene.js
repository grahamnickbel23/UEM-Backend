// workers/emailWorker.js
import { Worker } from "bullmq";
import IORedis from "ioredis";
import sendEmail from "../controller/notification/send email.js";
import adminInfoEmail from "../controller/notification/admin email.js";
import logger from "../logger/log logger.js";

// Configure Redis connection for BullMQ
const connection = new IORedis({
    maxRetriesPerRequest: null, // This is required for BullMQ
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    lazyConnect: true,
});

const worker = new Worker(
    "emailQueue",
    async job => {
        switch (job.name) {
            case "congratEmail":
                return await sendEmail.congratEmail(job.data.email, job.data.info);

            case "deliveryOTP":
                return await sendEmail.deliveryOTP(job.data.email, job.data.otp);

            case "alertEmailUpdate":
                return await sendEmail.alertEmailUpdate(job.data.email, job.data.fieldChanged);

            case "accountDeletedEmail":
                return await sendEmail.accountDeletedEmail(job.data.email);

            case "accountDeletedAdminEmail":
                return await sendEmail.accountDeletedAdminEmail(
                    job.data.userEmail,
                    job.data.adminEmail
                );

            case "achievementAddedEmail":
                return await sendEmail.achievementAddedEmail(
                    job.data.email,
                    job.data.username,
                    job.data.achievementTitle,
                    job.data.achievementType
                );

            case "achievementDeletedEmail":
                return await sendEmail.achievementDeletedEmail(
                    job.data.email,
                    job.data.username,
                    job.data.achievementTitle,
                    job.data.achievementType
                );

            case "adminInfoEmail":
                return await adminInfoEmail(
                    job.data.adminEmail,
                    job.data.userEmail,
                    job.data.info
                );


            default:
                throw new Error(`Unknown job type: ${job.name}`);
        }
    },
    { connection }
);

worker.on("completed", job => {
    logger.info(`${job.data.id} Email job ${job.id} of type ${job.name} completed`)
});

worker.on("failed", (job, err) => {
    logger.error(`${job.data.id} Email job ${job?.id} of type ${job?.name} failed:`, err);
});


export default worker;