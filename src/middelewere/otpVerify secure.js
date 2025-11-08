import localAuth from "../utils/localAuth utils.js";
import genaralResponse from "../utils/genaralResponse utils.js";
import logger from "../logger/log logger.js";

export default async function otpVerify(req, res, next) {

    // get the token data
    const data = req.token;
    const token = data.token;

    // if it is the local admin avoid all middelewere
    const localAdmin = process.env.ADMIN;
    const { admin } = req.body;
    if (admin === localAdmin) next();

    // cheak user from db 
    const userInfo = await localAuth.doesUserExisit(req, "info");
    if (!userInfo){ 
        logger.warn(`${req.requestId} 
        input: ${data, token } 
        OTP_VERIFY failed 
        returning: ${req.userid}`)
        // end request here
        return 
    }

    // token not return error
    genaralResponse.genaral400Error(!(token === userInfo.otpString), "error in otp token", res);
    if (!(token === userInfo.otpString)){
        logger.info(`${req.requestId} 
        input: ${ data, token } 
        OTP_VERIFY failed 
        returning: ${data}`)
        // end request here
        return
    };

    // if all ok proceed for next logic
    req.profile = userInfo;

    // genarate log after sucessful execution
    logger.info(`${req.requestId} 
        input: ${ data, token } 
        OTP_VERIFY sucessful 
        returning: ${userInfo._id}`)

    next();
}