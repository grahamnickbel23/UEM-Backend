import userSchema from "../../models/userSchema.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cryptoRandomString from "crypto-random-string";

export default class userAuth {

    // admin based user creation
    static async userSignup(req, res) {

        // get the incoming data
        const data = req.body;
        const { email, password, phone, employeeId } = req.body;

        // let's cheak if user is unqiuqe
        const emailExist = await userSchema.findOne({ emails: email });
        const phoneExist = await userSchema.findOne({ phones: phone });
        const employeeIdExist = await userSchema.findOne({ employeeId: employeeId });

        // return error if any of the above exisit
        if (emailExist || phoneExist || employeeIdExist) {
            return res.status(409).json({
                success: true,
                message: "user already exist"
            })
        }

        // if all ok hashed password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            data.password = hashedPassword;
        }

        // if user is unique create new user
        const newUser = userSchema(data);
        await newUser.save();

        // return success after user is saved
        return res.status(200).json({
            success: true,
            message: `new user created successfully`
        })
    }

    // email + employee id based login
    static async userLogin(req, res) {

        // get the requred info
        const { email, employeeId, password } = req.body;

        // cheak if user exisit
        const userExisit = await userSchema.findOne({
            emails: email,
            employeeId: employeeId
        })

        // if not return error
        if (!userExisit) {
            return res.status(404).json({
                sccess: false,
                message: "user does not exisit"
            })
        }

        // if all ok cheak does password match
        const doeesPasswordMatch = bcrypt.compare(password, userExisit.password);

        // return error if does not
        if (!doeesPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "password was incorrect"
            })
        }

        // genarate access token
        const jwt_key = process.env.JWT_KEY;
        const userId = userExisit._id;
        const accessToken = jwt.sign(
            {
                userId: userId,
                role: userExisit.role
            },
            jwt_key,
            { expiresIn: '1h' }
        )

        // genarate refresh token
        const refreshTokenString = cryptoRandomString({ length: 24, type: "alphanumeric" });
        const hashedToken = await bcrypt.hash(refreshTokenString, 10);

        // save hashed token to database
        await userSchema.findByIdAndUpdate(
            userId,
            { refreshTokenString: hashedToken }
        );

        const refreshToken = jwt.sign(
            { token: refreshTokenString },
            jwt_key,
            { expiresIn: '7d' }
        )

        // send cookies
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            //secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            //secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            sucess: true,
            message: 'logged in successfully'
        })
    }
}