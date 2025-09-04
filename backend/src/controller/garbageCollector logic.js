import userSchema from "../models/userSchema.js";
import achivementSchema from "../models/achivementSchema.js";
import logSchema from "../models/logSchema.js";
import logger from "../logger/log logger.js";

export default class garbageCollector {

    // permanently delete soft-deleted accounts after 7 days
    static async deleteAccounts() {
        try {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            const usersToDelete = await userSchema.find({
                isDeleted: true,
                deletedAt: { $lte: sevenDaysAgo }
            });

            if (usersToDelete.length === 0) {
                logger.info("No deleted accounts to purge at this time");
                return;
            }

            const deletedIds = usersToDelete.map(user => user._id);
            await userSchema.deleteMany({ _id: { $in: deletedIds } });

            logger.info(`Garbage Collector: Permanently deleted ${deletedIds.length} user(s)`)
        } catch (err) {
            logger.error("Error while deleting accounts:", err)
        }
    }

    // permanently delete soft-deleted documents after 3 days
    static async deleteDocs() {
        try {
            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

            const docsToDelete = await achivementSchema.find({
                isDeleted: true,
                deletedAt: { $lte: threeDaysAgo }
            });

            if (docsToDelete.length === 0) {
                logger.info("No deleted documents to purge at this time.");
                return;
            }

            const deletedDocIds = docsToDelete.map(doc => doc._id);
            await achivementSchema.deleteMany({ _id: { $in: deletedDocIds } });

            // cleanup references in userModel
            await mongoose.model("userModel").updateMany(
                { "achivementSchema.url": { $in: deletedDocIds } },
                { $pull: { achivementSchema: { url: { $in: deletedDocIds } } } }
            );

            logger.info(`Garbage Collector: Permanently deleted ${deletedDocIds.length} doc(s)`)
        } catch (err) {
            logger.error("Error while deleting documents:", err)
        }
    }

    // delete logs older than 10 days
    static async deleteLogs() {
        try {
            const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

            const result = await logSchema.deleteMany({
                timestamp: { $lte: tenDaysAgo }
            });

            if (result.deletedCount === 0) {
                logger.info("Garbage Collector: No old logs to delete");
                return;
            }

            logger.info(`Garbage Collector: Deleted ${result.deletedCount} old log(s)`);
        } catch (err) {
            logger.error("Error while deleting old logs:", err);
        }
    }
}
