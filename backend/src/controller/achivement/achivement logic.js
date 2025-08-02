import achivementSchema from "../../models/achivementSchema.js";
import localAuth from "../../utils/localAuth utils.js";
import imageProcessing from "../../utils/imgePrecessing utils.js";
import AWSServices from "../../utils/aws utils.js";
import getMetaData from "../../utils/metadata utils.js";
import { v4 as uuid } from 'uuid';

export default class achivementController {

    // function for achivement doc creation
    static async docCreation(req, res) {

        // get the info first
        const data = req.body;
        const userId = req.token?.userId || data.userId;
        const filePaths = req.files;

        // cheack if the target user even exisit
        const doesUserExisit = await localAuth.userIdAuth(userId, res);

        // stop execution if local auth failed
        if (!doesUserExisit) return

        // define arrey to store processd image before sending to a specific folder
        const processedImage = [];

        // do image processing if image is provided
        if (filePaths) {

            // get all the image via loop
            for (const file of filePaths) {

                // output file name
                const outputFileName = `${uuid()}.webp`;

                // process image and return link 
                const imageURL = await imageProcessing(300, 200, file, '/uploads', outputFileName);

                // meta data for file 
                const metaDataObject = getMetaData(userId, data.title, data.targetId);

                // upload images to aws and return link
                const fileURL = await AWSServices.uploadAWS('uem-backend/achivement-image/', imageURL, metaDataObject);

            }

            // if exisit let update info in mongoDB
            const newData = new achivementSchema(data);
            await newData.save();

            // return ok if all ok
            return res.status(200).json({
                success: true,
                message: `achivement uploaded successfully`
            })
        }
    }
}