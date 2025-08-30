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

        /// convert phone into expected schema format
        if (req.body.phone && typeof req.body.phone === "string") {
            req.body.phone = [{ mobileNumber: Number(req.body.phone) }];
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

    // get info for user profile
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
        const userDetails = userInfo.toObject(); // convert mongoose doc → plain object
        delete userDetails.password;
        delete userDetails.otpString;
        delete userDetails.refreshTokenString;

        // return user info i response
        return res.json({
            success: true,
            user: userDetails
        });
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
        logger.info(`${req.reurestId} input: ${data} ACESSTOKEN_USING_REFRESH_TOKEN`)

        // send ok if all ok
        genaralResponse.genaral200Response("new acesstoken send succesfully", res)
    }
}