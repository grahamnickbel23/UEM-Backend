import userSchema from "../models/userSchema.js";
import achivementSchema from "../models/achivementSchema.js";
import logger from "../logger/log logger.js";
import path from 'path'

export default class localAuth {

    // does user exisit
    static async doesUserExisit(req, target) {

        // get any identifiable data from request
        let { email, userId, phone, employeeId } = req[target];

        // let's cheak if user exist
        const userInfo = await userSchema.findOne({
            $or: [
                { "_id": userId },
                { "email": email },
                { "phone": phone },
                { "employeeId": employeeId },
            ]
        })

        // better logging
        logger.info(`${req.requestId} 
            input: email=${email}, userId=${userId}, phone=${phone}, employeeId=${employeeId}
            LOCAL_AUTH was successful 
            return: ${userInfo ? userInfo._id.toString() : "null"}`);

        // return what we for
        return userInfo;
    }

    // genaral docuemetn auth
    static async documentAuth(req, res) {

        // get any identifiable data from request
        let { docId, title, oldTitle } = req.body;

        // cheak of document exisit
        const doesDocExist = await achivementSchema.findOne({
            $or: [
                { "_id": docId },
                { "title": oldTitle ?? title }
            ]
        });

        // if not found return error
        if (!doesDocExist) {
            return res.status(404).json({
                success: false,
                message: `document does not exisit`
            })
        }

        // create a log
        logger.info(`${req.requestId} 
            input: ${docId, title, oldTitle} 
            DOC_AUTH was sucessful 
            return: ${JSON.stringify(doesDocExist._id), null, 2}`)

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