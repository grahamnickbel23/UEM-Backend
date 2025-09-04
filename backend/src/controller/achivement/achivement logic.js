import achivementSchema from "../../models/achivementSchema.js";
import localAuth from "../../utils/localAuth utils.js";
import achivementFnc from "../../utils/achivementFile utils.js";
import AWSServices from "../../utils/aws utils.js";
import { emailQueue } from "../../quene/genaral quene.js";
import genaralResponse from "../../utils/genaralResponse utils.js";
import userSchema from "../../models/userSchema.js";
import logger from "../../logger/log logger.js";

export default class achivementController {

    // function for achivement doc creation
    static async docCreation(req, res) {

        // get the info first
        const data = req.body;
        const creatorId = req.info.userId;
        const userId = data.person;
        const imagePaths = (req.files?.images || []).map(f => f.path);
        const docPath = (req.files?.doc || []).map(f => f.path);


        // cheack if the target user even exisit
        const doesUserExisit = await localAuth.doesUserExisit(req, "info");

        // stop execution if local auth failed
        if (!doesUserExisit) return

        // aws upload and url return
        const fileURL = await achivementFnc.aschivementFileUpload(req, imagePaths, docPath, userId, data);

        // segment links for image and doc
        data.imageURL = (fileURL.imageURL || []).reduce((acc, file, index) => {
            acc[(index + 1).toString()] = file.key;
            return acc;
        }, {});

        data.docURL = (fileURL.docURL || []).reduce((acc, file, index) => {
            acc[(index + 1).toString()] = file.key;
            return acc;
        }, {});

        // assign creator ID
        data.createdBy = creatorId;

        // if exisit let update info in mongoDB
        const newData = new achivementSchema(data);
        await newData.save();

        // send user an alert email after achivement creation is succesful
        const achivementJob = await emailQueue.add("achievementAddedEmail", {
            id: req.requestId,
            email : doesUserExisit.email[0],
            username : doesUserExisit.firstName,
            achievementTitle : data.title,
            achievementType : data.achivementType
        })

        // create a log
        logger.info(`${req.requestId} 
            input: ${data, creatorId}
            ADDED_QUENE was sucessfull
            job id: ${achivementJob.id}`)

        logger.info(`${req.requestId} 
            input: ${data, creatorId}
            DOC_CREATION was sucessfully
            return: ${newData._id}`)

        // return ok if all ok
       genaralResponse.genaral200Response( `achivement uploaded successfully`, res);
    }

    // function for acivement doc read
    static async docRead(req, res) {

        // cheak if document exisit
        const doesDocExisit = await localAuth.documentAuth(req, res);

        // stop execution if document does not exisit
        if (!doesDocExisit) return

        // create a log
        logger.info(`${req.requestId} 
            input: ${doesDocExisit._id}
            DOC_READ was sucessful`)

        // return mongoDb
        genaralResponse.genaral200Response(doesDocExisit, res);
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
        await AWSServices.downloadAWS(req, key, res);

        // create a log
        logger.info(`${req.requestId} 
            input: ${docId, key}
            DOC_DOWNLOAD was sucessful`)

    }

    // function for achivement doc deletion
    static async docDelete(req, res) {

        /* this acces either title or docid as argument along with tokens
        even if frontend send id as afgument we can search through mongo and get
        the doc id */

        // cheak if the document exisit
        const doesDocExisit = await localAuth.documentAuth(req, res);
        if (!doesDocExisit) return;

        // get user email
        const userId = doesDocExisit.person;
        const userData = await userSchema.findById( userId );

        // deleted the document
        const deletedDocument = await achivementSchema.findByIdAndUpdate(
            doesDocExisit._id,
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        // return error if not deleted properly
        genaralResponse.genaral400Error(
            !(deletedDocument.isDeleted && deletedDocument.deletedAt), "failed to delete an document", res);
        if (!(deletedDocument.isDeleted && deletedDocument.deletedAt)) return;

        // notify user via email about deletion
        const job = await emailQueue.add("achievementDeletedEmail", {
            id: req.requestId,
            email : userData.email[0],
            username : userData.firstName,
            achievementTitle : doesDocExisit.title,
            achievementType : doesDocExisit.achivementType
        })

        // create a log
        logger.info(`${req.requestId} 
            input: ${userId, doesDocExisit._id}
            ADDED_QUENE was successful
            job id: ${job.id}`)

        logger.info(`${req.requestId} 
            input: ${userId, doesDocExisit._id}
            DOC_DELETE was sucessful`)

        // return on if all ok
        genaralResponse.genaral200Response("document info moved to recycle bin", res);
    }
}