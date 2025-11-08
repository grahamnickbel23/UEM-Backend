import localAuth from "../../utils/localAuth utils.js";
import genaralResponse from "../../utils/genaralResponse utils.js";
import logger from "../../logger/log logger.js";

export default class adminControl {

    // get info for other user's profile
    static async getInfoForOtherUser(req, res) {

        // make a queary to db
        const userInfo = await localAuth.doesUserExisit(req, "body");

        // return error if user been soft deleted
        genaralResponse.genaral400Error(
            (userInfo.isDeleted === true || userInfo.deletedAt !== null),
            "User does not exist",
            res
        )

        // edit response
        const userDetails = userInfo.toObject();
        delete userDetails.password;
        delete userDetails.otpString;
        delete userDetails.refreshTokenString;

        // logged the api use
        logger.info(`${req.requestId} sending profile info of id: ${userInfo._id}`)

        // return user info i response
        return res.json({
            success: true,
            user: userDetails
        });
    }

    // ger profile pic other people 
    static async otherPicDownload(req, res, context) {

        // get the all info of the user
        const user = await localAuth.doesUserExisit(req, "body")

        // extract profile pic key from user record
        const awsKey = user[context];

        // stream the file directly from AWS to response
        await AWSServices.downloadAWS(req, awsKey, res);

        // log success
        logger.info(`${req.requestId} 
            input: ${user._id}, key: ${awsKey}
            PROFILE_PIC_DOWNLOAD successful`);
    }

    // send an internal response to nginx to retrict file acess to non admin user
    static async provideNginxConcent(req, res) {

        // make a queary to db
        const userInfo = await localAuth.doesUserExisit(req, "info");

        // return error if user been soft deleted
        genaralResponse.genaral400Error(
            (userInfo.isDeleted === true || userInfo.deletedAt !== null),
            "User does not exist",
            res
        )

        // logged api use
        logger.info(`${req.requestId} providing nginx statuscode: 200`)

        // return user info i response if all ok
        return res.sendStatus(200);
    }

    // verigy if token if admin or not
    static async isItAdminToken(req, res) {

        // get data from token
        const data = req.info;

        // logged api use
        logger.info(`${req.requestId} cookies contain role: ${data.role}`)

        if (data.role == "admin") {
            return res.json({
                success: true,
                message: `It is admin token`
            })
        } else {
            return res.json({
                sucess: false,
                message: `It is not admin token`
            })
        }
    }

    // verify if otp token is there was not
    static async isOtpTokenThere(req, res) {

        // logged api useage
        logger.info(`${req.requestId} top token is there`)

        return res.json({
            sucess: true,
            message: 'all good'
        })
    }
}