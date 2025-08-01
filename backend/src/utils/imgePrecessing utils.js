import sharp from "sharp";
import fs from "fs"
import path from "path";

export default async function imageProcessing(width, height, inputPath, outputPath, fileName) {

    // output filepath
    const outputFilePath = path.join(outputPath, fileName);

    // sharpebased image processing
    await sharp(inputPath)
        .resize(width, height)
        .toFormat('webp')
        .toFile(outputFilePath)

    // delete file after post pressing
    await fs.rm(inputPath)

    // return processed file path
    return outputFilePath
}