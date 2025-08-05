import achivementSchema from "../../models/achivementSchema.js";
import localAuth from "../../utils/localAuth utils.js";
import achivementFnc from "../../utils/achivementFile utils.js";
import AWSServices from "../../utils/aws utils.js";

export default class achivementController {

    // function for achivement doc creation
    static async docCreation(req, res) {

        // get the info first
        const data = req.body;
        const creatorId = req.token.id;
        const userId = data.person;
        const imagePaths = req.files['images'] || [];
        const docPath = req.files['doc'] || [];

        // cheack if the target user even exisit
        const doesUserExisit = await localAuth.userIdAuth(userId, res);

        // stop execution if local auth failed
        if (!doesUserExisit) return

        // aws upload and url return
        const fileURL = await achivementFnc.aschivementFileUpload(imagePaths, docPath, userId, data);

        // segment links for image and doc
        data.imageURL = (fileURL.imageURL || []).reduce((acc, url, index) => {
            acc[(index + 1).toString()] = url;
            return acc;
        }, {});

        data.docURL = (fileURL.docURL || []).reduce((acc, url, index) => {
            acc[(index + 1).toString()] = url;
            return acc;
        }, {});

        // assign creator ID
        data.createdBy = creatorId;

        // if exisit let update info in mongoDB
        const newData = new achivementSchema(data);
        await newData.save();

        // return ok if all ok
        return res.status(200).json({
            success: true,
            message: `achivement uploaded successfully`
        })
    }

    // function for acivement doc read
    static async docRead(req, res) {

        // first collect incoming info
        const { docId } = req.body;

        // cheak if document exisit
        const doesDocExisit = await localAuth.documentAuth(docId, res);

        // stop execution if document does not exisit
        if (!doesDocExisit) return

        // clone and sanitize the document before sending
        const sanitizedDoc = {
            ...doesDocExist._doc
        };

        // remove S3-related keys
        delete sanitizedDoc.docURL.url;
        delete sanitizedDoc.imgURL.url;

        // return mongoDb
        return res.status(200).json({
            success: true,
            message: sanitizedDoc
        })
    }

    // function for doc preview from aws s3
    static async docPreview(req, res) {

        // collect incoming info 1st
        const { docId, key } = req.body;

        // verify key is corrupt or not
        const response = localAuth.verifyKey(docId, key, res);

        // stop execution of verify key fails
        if (!response) return

        // call aws file streaming
        await AWSServices.downloadAWS(key, res);
    }

    // function for achivement doc deletion
    static async docDelete(req, res) {

        // get the info first
        const { docId } = req.body;

        // cheak if document exisit
        const doesDocExisit = await localAuth.documentAuth(docId, res);

        // stop execution if document does not exisit
        if (!doesDocExisit) return

        // find the aws document keys
        const imgKeys = doesDocExisit._doc.imgURL.key;
        const docKeys = doesDocExisit._doc_docURL.key;

        // delete the item from aws
        await achivementFnc.achivementFileDelete(imgKeys, docKeys);

        // delete the document from mongoB itself
        await achivementSchema.findByIdAndDelete({ _id: docId })

        // return ok if all good
        return res.status(200).json({
            success: true,
            message: `document deleted sucessfully`
        })
    }
}