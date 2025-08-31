import logger from "../logger/log logger.js";
import genaralResponse from "../utils/genaralResponse utils.js";

export default class admin {

    static async adminAuthLogic(req, res) {

        // cheak for the local admin
        const localAdmin = process.env.ADMIN;
        const { userId, admin } = req.body;

        // get the role from the acess token
        const { role } = req.info || {};

        // send error if user is not a admin
        if (!(role === 'admin' || admin === localAdmin)) {

            const info = `this route requre admin acess`;
            return genaralResponse.genaral400Error(25, info, res);
        }

        const result = userId ?? "localAdmin";

        // genarate log after sucessful execution
        logger.info(`${req.requestId} 
            input: ${userId, admin} 
            ADMIN_AUTH sucessful 
            returning: ${result}`)

        return result;
    }

    static async adminAuth(req, res, next) {

        // get userId in return
        const result = await admin.adminAuthLogic(req, res);

        if (!result) {
            // genarate log after error
            logger.error(`${req.requestId} 
            ADMIN_AUTH 
            error returning: ${result}`)

            // return error
            return
        }

        // return admin id or localAdmin
        req.admin = result;

        // move to the next middelewere
        next(); 
    }
}