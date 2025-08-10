import jwt from 'jsonwebtoken';
import cryptoRandomString from 'crypto-random-string';
import bcrypt from 'bcrypt';
import userSchema from '../../models/userSchema.js';
import localAuth from '../../utils/localAuth utils.js';

export default async function issueAcessToken(req, res) {

    // get the incoming info
    const tokenString = req.token.token;
    const { userId } = req.body;

    // cheak if the user exisit
    const doesUserExisit = await localAuth.userIdAuth(userId, res);

    // if return error stop execution
    if (!doesUserExisit) return

    // cheak if both are same
    const doesRefreshStringSame = await bcrypt.compare(tokenString, doesUserExisit.refreshTokenString);

    // return error if both token are not same 
    if (!doesRefreshStringSame) {
        return res.status(400).json({
            success: false,
            message: `invalid refresh token id`
        })
    }

    // produce a new refresh string
    const newRefreshToken = cryptoRandomString({ length: 24, type: "alphanumeric" });
    const hashedToken = await bcrypt.hash(newRefreshToken, 10);

    // save new hashed token to db
    await userSchema.findByIdAndUpdate(
        { _id: userId },
        {
            refreshTokenString: hashedToken
        }
    )

    // issue new acess token
    const jwt_key = process.env.JWT_KEY;
    const accessToken = jwt.sign(
        {
            userId: userId,
            role: doesUserExisit.role
        },
        jwt_key,
        { expiresIn: '1h' }
    )

    // send cookies
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        //secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000 // 1 hour
    });

    return res.status(200).json({
        sucess: true,
        message: 'logged in successfully'
    })
}