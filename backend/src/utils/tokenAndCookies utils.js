import userSchema from '../models/userSchema.js';
import jwt from 'jsonwebtoken';
import cryptoRandomString from "crypto-random-string";
import logger from '../logger/log logger.js';

export default class tokenAndCookies {

    // genarate acess token and send cookes for it
    static async acessTokenAndCookies(req, userExisit, res) {

        // token genaration
        const jwt_key = process.env.JWT_KEY;
        const accessToken = jwt.sign(
            {
                userId: userExisit._id,
                role: userExisit.role
            },
            jwt_key,
            { expiresIn: '1h' }
        )

        // send cookies
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            //secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        // create a log
        logger.info(`${req.requestId} 
            input: ${ userExisit._id }
            ACESSTOKEN_CREATION was sucessful`)
    }

    // genarte refresh token and send cookies for it
    static async refreshTokenAndCookies(req, tokenName, validity, userId, schema, res) {

        // genarate refresh token string
        const refreshTokenString = cryptoRandomString({ length: 24, type: "alphanumeric" });

        // save hashed token to database
        await userSchema.findByIdAndUpdate(
            userId,
            { [schema] : refreshTokenString }
        );

        // genarate refresh token
        const jwt_key = process.env.JWT_KEY;
        const refreshToken = jwt.sign(
            { token: refreshTokenString },
            jwt_key,
            { expiresIn: validity }
        )

        res.cookie(tokenName, refreshToken, {
            httpOnly: true,
            //secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: this.cookieValidityFnc(validity) // 7 days
        });

        // create a log
        logger.info(`${req.requestId} 
            input: ${tokenName, validity, userId, schema} 
            GENARAL_TOKEN was sucessful `)
    }

    // function to tie validity of token to the validity of cookies
    static cookieValidityFnc(validity) {
        const unit = validity.slice(-1); // last character: s, m, h, d
        const amount = parseInt(validity.slice(0, -1), 10);

        switch (unit) {
            case 's': return amount * 1000;
            case 'm': return amount * 60 * 1000;
            case 'h': return amount * 60 * 60 * 1000;
            case 'd': return amount * 24 * 60 * 60 * 1000;
            default: throw new Error("Unsupported validity format");
        }
    }

}