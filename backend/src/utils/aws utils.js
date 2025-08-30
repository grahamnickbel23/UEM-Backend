import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import connectAWS from "../../connectAWS.js";
import logger from "../logger/log logger.js";
import fs from 'fs/promises';
import path from 'path'

export default class AWSServices {

    // define a global Bucket
    static awsBucket() {  return process.env.BUCKET_NAME };

    // method for document upload in s3
    static async uploadAWS(req, awsFilePath, inputPath, metaData) {

        // get the filename from filepath
        const fileName = path.basename(inputPath);

        // get the file to our ram shirtly before uploading to aws s3
        const fileHeap = await fs.readFile(inputPath);

        // file upload path
        const s3 = `${awsFilePath}/${fileName}`;

        // now let us upload this to aws s3
        const uploadComand = new PutObjectCommand({
            Bucket: AWSServices.awsBucket(),
            Key: s3,
            Body: fileHeap,
            ContentType: AWSServices.getMimeType(fileName),
            // only if metadata exisit
            ...(metaData && { Metadata: metaData })
        })

        // now let us use the comand 
        await connectAWS().send(uploadComand)

        // url of each uploaded file
        const AWSFileURL = `${s3}`;

        // genarate log after sucessful execution
        logger.info(`${req.requestId} 
            input: ${ awsFilePath, inputPath, metaData } 
            AWS_UPLOAD sucessful 
            returning: ${s3}`)

        return {
            url: AWSFileURL,
            key: s3
        };
    }
    
    // aws methid for downloading files at DB
    static async downloadAWS(req, awsKey, res) {

        const downloadComand = new GetObjectCommand({
            Bucket: AWSServices.awsBucket(),
            Key: awsKey
        })

        // apply getobject comand
        const response = await connectAWS().send(downloadComand);

        // Set appropriate headers so the browser renders (not downloads)
        res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${awsKey}"`);

        // genarate log after sucessful execution
        logger.info(`${req.requestId} 
            input: ${ awsKey } 
            AWS_DOWNLOAD sucessful 
            returning files`)

        // Pipe the file stream directly to the client response
        response.Body.pipe(res);
    }

    // aws method for deleting file at db
    static async deleteAWS(req, key) {

        // delete comand
        await connectAWS().send(DeleteObjectCommand({
            Bucket: AWSServices.awsBucket(),
            Key: key
        }))

        // genarate log after sucessful execution
       logger.info(`${req.requestId} input: ${ key } AWS_DELETE sucessful`)
    }

    // helper function
    static getMimeType(fileName) {
        const ext = path.extname(fileName).toLowerCase();
        const mimeTypes = {
            '.mpd': 'application/dash+xml',
            '.m4s': 'video/iso.segment',
            '.webm': 'audio/webm',
            '.mp3': 'audio/mpeg',
            '.opus': 'audio/ogg',
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }
}