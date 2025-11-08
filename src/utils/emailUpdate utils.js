import userSchema from "../models/userSchema.js";
import { redisConnect } from "../../connectRedis.js";
import sendEmail from "../controller/notification/send email.js";
import adminInfoEmail from "../controller/notification/admin email.js";
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
        await sendEmail.congratEmail(email, info);

        // semd email to admin 
        await adminInfoEmail(adminEmail, email, userInfo);

        // genarate log after sucessful execution
        let passd = null;
        if (password) { passd = "password inserted" };

        logger.info(`${req.requestId} 
            input: ${email, passd, adminEmail}
            UPDATE_EMAIL was sucessful `)
    };

    // update for user deleting
    static async deletedAccountUpdate(req, userEmail, adminEmail){

        // send email to the user who's account been deleted
        await sendEmail.accountDeletedEmail(userEmail);

        // send email to the admin who delete the user
        await sendEmail.accountDeletedAdminEmail(userEmail, adminEmail);

        // genarate log after sucessful execution
        logger.info(`${req.requestId} 
            input: ${userEmail, adminEmail} 
            UPDATE_EMAIL was sucessful `)
    }
}