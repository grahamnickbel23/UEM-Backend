import userSchema from "../models/userSchema.js";
import achivementSchema from "../models/achivementSchema.js";
import bcrypt from 'bcrypt';
import path from 'path'

export default class localAuth {

    // user id auth
    static async userIdAuth(userId, res) {

        // cheak if this userid exisit
        const doesUserIdExisit = await userSchema.findById(userId)

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

    // genaral docuemetn auth
    static async documentAuth(docId, res) {

        // cheak of document exisit
        const doesDocExist = await achivementSchema.findById(docId);

        // if not found return error
        if (!doesDocExist) {
            return res.status(404).json({
                success: false,
                message: `document does not exisit`
            })
        }

        return doesDocExist
    }

    // corrupt key auth
    static async verifyKey(docId, foraignKey, res) {

        // get the full key from document
        const doc = achivementSchema.findById(docId);
        const folder = path.posix.dirname(foraignKey);
        const folderName = folder.split('/');
        const mainFolder = folderName[1];

        // verify the main key
        if (mainFolder === 'achivement-image') {
            const verifyKey = doc._doc.imageURL.key
            if (verifyKey != foraignKey) {

                // return error if key is corrupt
                return res.status(400).json({
                    success: false,
                    message: `key is corrupt`
                })
            }
        }

        // verify main key
        if (mainFolder === 'achivement-other') {
            const verifyKey = doc._doc.imageURL.key
            if (verifyKey != foraignKey) {

                // return error if key is corrupt
                return res.status(400).json({
                    success: false,
                    message: `key is corrupt`
                })
            }
        }

        // return 1 if execution sucessful
        return 1
    }
}