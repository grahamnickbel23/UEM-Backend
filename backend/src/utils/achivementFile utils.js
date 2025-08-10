import imageProcessing from "./imgePrecessing utils.js";
import AWSServices from "./aws utils.js";
import getMetaData from "./metadata utils.js";
import { v4 as uuid } from 'uuid';

export default class achivementFnc {

    // function to save files in aws
    static async aschivementFileUpload(imagePaths, docPaths, userId, data) {

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
                const imageURL = await imageProcessing(300, 200, img, '/uploads', outputFileName);

                // meta data for image
                const metaDataObject = getMetaData(userId, data.title, data.person);

                // upload images to aws and return link
                const imgLocation = await AWSServices.uploadAWS('uem-backend/achivement-image/', imageURL, metaDataObject);

                // add image url to a arrey
                processedImage.push(imgLocation);
            }
        }

        if (docPaths) {

            // get all the doc via loop
            for (const doc of docPaths) {

                // meta data for doc
                const metaDataObject = getMetaData(userId, data.title, data.person);

                // upload image to aws
                const fileURL = await AWSServices.uploadAWS('uem-backend/achivement-other/', doc, metaDataObject);

                // add doc url to a arrey
                processedDoc.push(fileURL);
            }
        }

        // retun an object with all aws links
        return {
            imageURL: processedImage,
            docURL: processedDoc
        }
    }

    // function to delete doc from aws
    static async achivementFileDelete( imgId, docId ){

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
    }
}