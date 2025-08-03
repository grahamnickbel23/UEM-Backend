import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import connectAWS from "../../connectAWS.js";
import fs from 'fs/promises';
import path from 'path'

export default class AWSServices {

    // define a global Bucket
    static awsBucket = process.env.BUCKET_NAME;

    // method for document upload in s3
    static async uploadAWS(awsFilePath, inputPath, metaData) {

        // get the filename from filepath
        const fileName = path.basename(inputPath);

        // get the file to our ram shirtly before uploading to aws s3
        const fileHeap = await fs.readFile(inputPath);

        // file upload path
        const s3 = `${awsFilePath}/${fileName}`;

        // now let us upload this to aws s3
        const uploadComand = new PutObjectCommand({
            Bucket: AWSServices.awsBucket,
            Key: s3,
            Body: fileHeap,
            ContentType: AWSServices.getMimeType(fileName),
            Metadata: metaData
        })

        // now let us use the comand 
        await connectAWS().send(uploadComand)

        // url of each uploaded file
        const AWSFileURL = `https://${AWSServices.awsBucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3}`;

        return {
            url: AWSFileURL,
            key: s3
        };
    }
    
    // aws methid for downloading files at DB
    static async downloadAWS(awsKey, res) {

        const downloadComand = new GetObjectCommand({
            Bucket: AWSServices.awsBucket,
            Key: awsKey
        })

        // apply getobject comand
        const response = await connectAWS().send(downloadComand);

        // Set appropriate headers so the browser renders (not downloads)
        res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${awsKey}"`);

        // Pipe the file stream directly to the client response
        response.Body.pipe(res);
    }

    // aws method for deleting file at db
    static async deleteAWS(key) {

        // delete comand
        await connectAWS().send(DeleteObjectCommand({
            Bucket: AWSServices.awsBucket,
            Key: key
        }))
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