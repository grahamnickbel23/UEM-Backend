import imageProcessing from "./imageProcessing utils.js";
import logger from "../logger/log logger.js";
import AWSServices from "./aws utils.js";
import getMetaData from "./metadata utils.js";
import fs from "fs/promises";
import { v4 as uuid } from 'uuid';

export default class achivementFnc {

    // function to save files in aws
    static async aschivementFileUpload(req, imagePaths, docPaths, userId, data) {

        // define arrey to store processd image + doc before sending to a mongoDb
        const processedImage = [];
        const processedDoc = [];

        // do image processing if image is provided
        if (imagePaths) {

            // get all the image via loop
            for (const img of imagePaths) {

                // output file name
                const outputFileName = `${uuid()}.webp`;

                // process image and return link 
                const imageURL = await imageProcessing(req, 500, 500, img, '/uploads', outputFileName);

                // meta data for image
                const metaDataObject = getMetaData(req, userId, data.title, data.person);

                // upload images to aws and return link
                const imgLocation = await AWSServices.uploadAWS(req, 'achivement-image', imageURL, metaDataObject);

                // delete image once uploaded
                await fs.rm(imageURL);
                

                // add image url to a arrey
                processedImage.push(imgLocation);
            }
        }

        if (docPaths) {

            // get all the doc via loop
            for (const doc of docPaths) {

                // meta data for doc
                const metaDataObject = getMetaData(req, userId, data.title, data.person);

                // upload image to aws
                const fileURL = await AWSServices.uploadAWS(req, 'achivement-other', doc, metaDataObject);

                // delete files once uploaded
                await fs.rm(doc);

                // add doc url to a arrey
                processedDoc.push(fileURL);
            }
        }


        // genarate log after sucessful execution
        logger.info(`${req.requestId} 
            input: ${userId, data._id},
            ACHIVEMENT_UPLOAD sucessful `)
        

        // retun an object with all aws links
        return {
            
            imageURL: processedImage,
            docURL: processedDoc
        }
    }

    // function to delete doc from aws
    static async achivementFileDelete( req, imgId, docId ){

        // delete image if have one
        if(imgId){

            // get all the image via loop
            for (const img of imgId){

                // delete image one by one
                await AWSServices.deleteAWS(img);
            }
        }

        // delete doc if have one
        if(docId){

            // get all via loop
            for (const doc of docId){

                // delete doc one by one
                await AWSServices.deleteAWS(doc)
            }
        }

        // genarate log after sucessful execution
        logger.info(`${req.requestId} 
            input: ${ imgId, docId } 
            ACHIVEMENT_FILE_DEL sucessful`)
    }
}