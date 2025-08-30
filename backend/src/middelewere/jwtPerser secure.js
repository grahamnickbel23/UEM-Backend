import { promisify } from "util";
import jwt from "jsonwebtoken";
import genaralResponse from "../utils/genaralResponse utils.js";
import wrapperFunction from "../utils/asyncHandeller utils.js";
import logger from "../logger/log logger.js";

const verifyPromise = promisify(jwt.verify);

export default class jwtPerser {

    // jwt middelewere wrapper that return the actual middelewere
    static jwtWrapper = (cookieName, outputKey) => {
        return wrapperFunction.asyncHandeller(async (req, res, next) => {

            // get the local admin
            const localAdmin = process.env.ADMIN;
            const { admin } = req.body || { };

            if (admin == localAdmin) {

                // attach payload to req under dynamic key
                req[outputKey] = null;

                // create a log
                logger.info(`${req.requestId}, 
                input: ${cookieName, outputKey}
                JWT_PERSER have sucessfully 
                passed by local Admin`)

                return next();
            };

            // get the token from cookies
            const token = req.cookies[cookieName];

            // return error if missing
            genaralResponse.genaral400Error(!token, `Missing or invalid ${cookieName}`, res);
            if (!token) return;

            // verify token
            const payload = await verifyPromise(token, process.env.JWT_KEY);

            // attach payload to req under dynamic key
            req[outputKey] = payload;

            // create a log
            logger.info(`${req.requestId}, 
                input: ${cookieName, outputKey}
                JWT_PERSER have sucessfully 
                persed ${cookieName} 
                producing: ${payload}`);

            // proceed
            next();
        }, `jwt parsing for ${cookieName}`);
    };
}
