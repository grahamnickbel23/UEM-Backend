import { PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import connectAWS from "../../connectAWS.js";
import fs from 'fs/promises';
import path from 'path'

export default class AWSServices{

    // method for document upload in s3
    static async uploadAWS(folder, inputPath, metaData){

        // get the filename from filepath
        const fileName = path.basename(inputPath);

        // get the file to our ram shirtly before uploading to aws s3
        const fileHeap = await fs.readFile(inputPath);

        // file upload path
        const s3 = `${folder}/${fileName}`;

        // now let us upload this to aws s3
        const uploadComand = new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: s3,
            Body: fileHeap,
            ContentType:AWSServices.getMimeType(fileName),
            Metadata: metaData
        }) 

        // now let us use the comand 
        await connectAWS().send(uploadComand)

        // url of each uploaded file
        const AWSFileURL = `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3}`;

        return AWSFileURL;
    }

    // aws method for updating files at DB
    static async updateAWS( folder, inpuPath, metaData ){
        return AWSServices.uploadAWS( folder, inpuPath, metaData );
    }

    // aws method for deleting file at db
    static async deleteAWS( folder, inputPath ){

        // get the filename from filepath
        const fileName = path.basename(inputPath);

        // file upload path
        const s3 = `${folder}/${fileName}`;

        // delete comand
        await connectAWS().send(DeleteObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: s3
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