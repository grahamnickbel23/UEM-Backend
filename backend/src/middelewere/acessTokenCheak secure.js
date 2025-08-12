import localAuth from "../utils/localAuth utils.js";

export default async function acessTokenCheak(req, res, next) {

    // get the creator email
    const { creatorEmail } = req.body;

    // get the user id
    let userId = req.token.userId;

    if(!userId){
        const doesEmailExiist = await localAuth.userEmailAuth(creatorEmail, res);
        userId = doesEmailExiist._id
    }


    // return error if acess token does not have userId
    if (!req.jwtPayload.userId || !creatorEmail ) {
        return res.status(400).json({ success: false, message: "Invalid access token or creator email" });
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