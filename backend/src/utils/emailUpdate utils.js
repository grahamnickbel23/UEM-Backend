import userSchema from "../models/userSchema.js";
import { redisConnect } from "../../connectRedis.js"
import { emailQueue } from "../quene/genaral quene.js";

import logger from "../logger/log logger.js";

export default class emailUpdate {

    // update for new user creation
    static async newUserUpdate(req) {

        // collect password from body
        const { email, password } = req.body;
        const data = async () => await userSchema.findById(req.info.userId);
        const adminEmail = req.info ? (await data()).email[0] : process.env.SUPPORT;

        // get all info about saved user from db
        const userInfo = await userSchema.findOne({ "email": email });
        let plainPassword = password;

        /* if admin don't provide password, mongoose hook gwnrate password 
        that password is saved in redis for 120 seconds and send to user
        whos account is created by email via node mailer */

        if (!password) {
            plainPassword = await redisConnect.get(email);
        }

        // collect all info
        const info = { email, password: plainPassword };

        // send email to the account holder
        const userJob = await emailQueue.add("congratEmail", { 
            id: req.requestId, 
            email, info });

        // semd email to admin 
        const adminJob = await emailQueue.add("adminInfoEmail", {
            id: req.requestId, 
            adminEmail,
            userEmail: email,
            info: userInfo
        });


        // genarate log after sucessful execution
        let passd = null;
        if (password) { passd = "password inserted" };

        logger.info(`${req.requestId} 
            input: ${email, passd, adminEmail}
            UPDATE_EMAIL was sucessfully 
            added to QUENE
            user job id: ${userJob.id}
            admin job id: ${adminJob.id}`)
    };

    // update for user deleting
    static async deletedAccountUpdate(req, userEmail, adminEmail) {

        // send email to the user who's account been deleted
        const userJob = await emailQueue.add("accountDeletedEmail", { 
            id: req.requestId, 
            email: userEmail });

        // send email to the admin who delete the user
        const adminJob = await emailQueue.add("accountDeletedAdminEmail", { 
            id: req.requestId, 
            userEmail, adminEmail })

        // genarate log after sucessful execution
        logger.info(`${req.requestId} 
            input: ${userEmail, adminEmail} 
            UPDATE_EMAIL was sucessfully 
            added to QUENE
            user job id: ${userJob.id}
            admin job id: ${adminJob.id}`)
    }
}