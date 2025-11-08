import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import logger from "../logger/log logger.js";

export default async function imageProcessing(req, width, height, inputPath, fileName) {

    // resolve input/output paths
    const absInputPath = path.resolve(inputPath);
    const absOutputDir = path.dirname(absInputPath);
    const outputFilePath = path.join(absOutputDir, fileName);

    // actual image processing
    await sharp(absInputPath)
        .resize(width, height)
        .toFormat("webp")
        .toFile(outputFilePath);
 
    // delete original file after image processing is done
    await fs.rm(absInputPath);

    // create a log
    logger.info(`${req.requestId} 
        input: ${ inputPath, fileName } 
        IMAGE_PROCESSING was sucessful `)

    // return processed file path
    return outputFilePath
}