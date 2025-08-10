import localAuth from "../utils/localAuth utils.js";

export default async function acessTokenCheak(req, res, next) {

    // get the user id
    const userId = req.token.userId;

    // return error if acess token does not have userId
    if (!req.jwtPayload.userId) {
        return res.status(400).json({ success: false, message: "Invalid access token" });
    }

    // cheak if user exisit
    const doesUserExisit = await localAuth.userIdAuth(userId, res);

    // stop pogress is user does not exist
    if (!doesUserExisit) return;

    // send user info for further processing
    req.userinfo = doesUserExisit;

    // if all ok move ahed to next 
    next();
}