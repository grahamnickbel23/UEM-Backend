import userSchema from "../../models/userSchema.js";
import AWSServices from "../../utils/aws utils.js";
import emailUpdate from "../../utils/emailUpdate utils.js";
import otpVerification from "./otpVerification logic.js";
import localAuth from "../../utils/localAuth utils.js";
import genaralResponse from "../../utils/genaralResponse utils.js";
import tokenAndCookies from "../../utils/tokenAndCookies utils.js";
import enhancedLogger from "../../logger/enhanced logger.js";
import logger from "../../logger/log logger.js";
import bcrypt from 'bcrypt';

export default class userAuth {

    // admin based user creation
    static async userSignup(req, res) {

        // get the incoming data
        const data = req.body;
        data.createdBy = req.admin;
        const imagePath = req.files['profileImage'][0].path;
        const idCardPath = req.files['idCard'][0].path;

        // convert phone inputs into expected schema format
        if (req.body.countryCode && req.body.mobileNumber) {
            req.body.phone = [
                {
                    countryCode: Number(req.body.countryCode) || 91,
                    mobileNumber: Number(req.body.mobileNumber)
                }
            ];
            delete req.body.countryCode;
            delete req.body.mobileNumber;
        }

        // convert adress into expected schema format
        if (req.body.address && typeof req.body.address === "string") {
            req.body.address = JSON.parse(req.body.address);
        }

        // let's cheak if user is unqiuqe
        const userInfo = await localAuth.doesUserExisit(req, "body");

        // return error if user already exisit
        const info = 'user already exist';
        enhancedLogger.authFailure(
            req.requestId,
            userInfo,            // ✅ trigger = true
            req.admin,       // userId
            "USER SIGNUP",   // action
            info,            // reason
            { attemptedUser: data.email }
        );
        genaralResponse.genaral400Error(userInfo, info, res);

        // get the link for profile image and idCard image
        data.profilePicURL = (await AWSServices.uploadAWS(req, 'profile-picture', imagePath)).url;
        data.idCardUrl = (await AWSServices.uploadAWS(req, 'achivement-image', idCardPath)).url;

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        // if user is unique create new user
        const newUser = userSchema(data);
        await newUser.save();

        logger.info(`new user created now!!!!`)

        // provide user notification via email
        await emailUpdate.newUserUpdate(req);

        // log if sucessful
        enhancedLogger.authSuccess(req.requestId, newUser._id, `USER SIGNUP`,
            { email: data.email });

        // return success after user is saved
        const comment = `new user created successfully`;
        genaralResponse.genaral200Response(comment, res);
    }

    // email + employee id based login
    static async requestLogin(req, res) {

        // get the requred info
        const { password } = req.body;

        // cheak if user exisit{
        const userExisit = await localAuth.doesUserExisit(req, "body");

        // if not return 404 error
        enhancedLogger.authFailure(req.requestId, !userExisit, null, "LOGIN REQUEST", "User not found",
            { body: req.body });

        genaralResponse.genaral404Error(!userExisit, 'user', res);
        if (!userExisit) return;

        // if all ok cheak does password match
        const doeesPasswordMatch = await bcrypt.compare(password, userExisit.password);

        // return error if does not
        const info = "password was incorrect";
        genaralResponse.genaral400Error(!doeesPasswordMatch, info, res);

        // send otp & ok if all ok
        await otpVerification.sendOTP(req, res);

        // create a log
        enhancedLogger.authSuccess(req.requestId, userExisit._id, "LOGIN REQUEST",
            { email: userExisit.email });
    }

    // verify otp and send cookies for login
    static async userLogin(req, res) {

        // get the data from the request
        const { email } = req.body;

        // verify otp
        const verificationSucessful = await otpVerification.multiFactorOTP(req, res);
        enhancedLogger.authFailure(
            req.requestId,
            !verificationSucessful,
            null,
            "USER_LOGIN",
            "OTP verification failed",
            { email });
        if (!verificationSucessful) return;

        // get the user info
        const userExisit = await userSchema.findOne({ email });

        // send acess token
        await tokenAndCookies.acessTokenAndCookies(req, userExisit, res);

        // send refresh token
        const tokenName = "login_refresh_token"
        const tokenValidity = '7d'
        const schema = 'refreshTokenString'
        await tokenAndCookies.refreshTokenAndCookies(
            req, tokenName, tokenValidity, userExisit._id, schema, res
        );

        // create a log in succesful
        enhancedLogger.authSuccess(req.requestId, userExisit, "USER_LOGIN", { email });

        // respond with all ok
        const comment = 'logged in successfully';
        genaralResponse.genaral200Response(comment, res);
    }

    // get info for own user profile
    static async allInfoForUserProfile(req, res) {

        // make a queary to db
        const userInfo = await localAuth.doesUserExisit(req, "info");

        /* we caounf have sent this via from /signin too,, but we have to
        think about frontend desgine too say when due to acess token the profile
        page loads up direct;y then obvisuly we woil not do a otp shit and 
        load a new page right ? so we must need to have a direct api for profile
        and this would not just return info from profile but also achivement too*/

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

    // get profile pic download api
    static async profilePicDownload(req, res, context) {

        // get the all info of the user
        const user = await localAuth.doesUserExisit(req, "info")

        // extract profile pic key from user record
        const awsKey = user[context];

        // stream the file directly from AWS to response
        await AWSServices.downloadAWS(req, awsKey, res);

        // log success
        logger.info(`${req.requestId} 
        input: ${user._id}, key: ${awsKey}
        PROFILE_PIC_DOWNLOAD successful`);
    }

    // logout function
    static async userLogout(req, res) {

        // delete access token cookie
        res.cookie("access_token", "", {
            httpOnly: true,
            sameSite: "Lax",
            expires: new Date(0)
        });

        // delete refresh token cookie
        res.cookie("login_refresh_token", "", {
            httpOnly: true,
            sameSite: "Lax",
            expires: new Date(0)
        });

        // delete otp token cookie
        res.cookie("otp_token", "", {
            httpOnly: true,
            sameSite: "Lax",
            expires: new Date(0)
        });

        // create a log
        logger.info(`${req.requestId} USER_LOGOUT: Tokens removed, user logged out successfully`);

        // respond to client
        genaralResponse.genaral200Response("Logged out successfully", res);
    }

    // verify refresh token and send acess token
    static async acessTokenIssue(req, res) {

        // get the info from the refresh token
        const data = req.token.token;

        // search via refreshtoken in userschema
        const userInfo = await userSchema.findOne({ "refreshTokenString": data });

        // produce and send acess token
        await tokenAndCookies.acessTokenAndCookies(req, userInfo, res);

        // create logger
        logger.info(`${req.requestId} input: ${data} ACESSTOKEN_USING_REFRESH_TOKEN`)

        // send ok if all ok
        genaralResponse.genaral200Response("new acesstoken send succesfully", res)
    }
}