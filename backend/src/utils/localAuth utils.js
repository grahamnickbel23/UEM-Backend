import userSchema from "../models/userSchema.js";
import bcrypt from 'bcrypt';

export default class localAuth {

    // user id auth
    static async userIdAuth(userId, res) {

        // cheak if this userid exisit
        const doesUserIdExisit = await userSchema.findOne({ _id: userId })

        // if not found return error
        if (!doesUserIdExisit) {
            return res.status(404).json({
                success: false,
                message: `user id does not exisit`
            })
        }

        return doesUserIdExisit
    }

    // genaral protected auth
    static async genaralAuth(userInfo, password, res) {

        // cheak if the record exist on schema
        const doesSchemaHaveData = await userSchema.findOne(userInfo);

        // handel error logs
        const errorInfo = Object.keys(userInfo)[0];

        // if no info is foun return error
        if (!doesSchemaHaveData) {
            return res.status(404).json({
                success: false,
                message: `${errorInfo} does not exisit`
            })
        }

        // if all ok go for password cheak
        const doesPasswordCorrect = await bcrypt.compare(password, doesSchemaHaveData.password);

        // if turn wrong return error
        if (!doesPasswordCorrect) {
            return res.status(409).json({
                success: false,
                message: `password was incorrect`
            })
        }

        return doesSchemaHaveData
    }

}