import cryptoRandomString from "crypto-random-string";
import sendEmail from "../notification/send email.js";
import userSchema from "../../models/userSchema.js";
import genaralResponse from "../../utils/genaralResponse utils.js";
import tokenAndCookies from "../../utils/tokenAndCookies utils.js";
import logger from "../../logger/log logger.js";
import { redisConnect } from "../../../connectRedis.js";
import bcrypt from 'bcrypt';

export default class otpVerification {

    // logic for sending otp
    static async sendOTP(req, res) {

        // get the input
        const { email } = req.body;

        // genarate ranfom otp
        const genarateOTP = cryptoRandomString({ length: 6, type: 'numeric' })

        // hashed the otp before saving into redis
        const hashedOTP = await bcrypt.hash(genarateOTP, 10);

        // save that otp in redis for 120 seconds
        await redisConnect.set(email, hashedOTP, { EX: 120 });

        // send the otp to the user
        await sendEmail.deliveryOTP(email, genarateOTP);

        // create a log
        logger.info(`${req.requestId} 
            input: ${ email }
            SEND_OTP was sucessful `)

        // if all ok send ok
        genaralResponse.genaral200Response("send otp sucessfuly", res);

    }

    // logic for multifactor otp verification
    static async multiFactorOTP(req, res) {

        // get the input
        const { email, otp } = req.body;

        // cheak the otp
        const cheakOTP = await redisConnect.get(email);
        const doesOTPMatch = await bcrypt.compare(otp, cheakOTP);

        // return error if wrong
        const info = `error in verifying otp`;
        genaralResponse.genaral400Error(!doesOTPMatch, info, res);
        if (!doesOTPMatch) return;  // to stop futhrer execution

        // if otp is valid remove it from redis
        await redisConnect.del(email)

        // return ok if sucessful
        return 420;
    }

    // logic for genaral otp verification
    static async verifyOTP(req, res){

        // get the input
        const { email } = req.body;

        // cheak the otp 1st
        const doesOTPCorrect = await otpVerification.multiFactorOTP(req, res);
        if (!doesOTPCorrect) return;

        // return a verification token

        /* here we are using refresh token function for storing otp
        verification string, this string just like refresh token is also
        saved in main db and chnage once a new token is issued.
        here we are using a modifie version of reshresh token function*/

        // get the user info
        const userExisit = await userSchema.findOne({email});
        const userId = userExisit._id;

        const tokenName = 'otp_token';
        const tokenValidity = '1h';
        const schema = 'otpString';
        await tokenAndCookies.refreshTokenAndCookies(
            req, tokenName, tokenValidity, userId, schema, res
        );

        // create a log
        logger.info(`${req.requestId} 
            input: ${ email }
            VERIFY_OTP was sucessful `)

        // respond with all ok
        const comment = 'otp verified successfully';
        genaralResponse.genaral200Response(comment, res);
    }
}