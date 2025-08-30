import logger from "../logger/log logger.js";

export default function getMetaData(
    req, userId, docTitle, uploadedBy
) {
    const date = new Date();

    // HH:MM:SS
    const idealTime = date.toLocaleTimeString("en-GB", { hour12: false });

    // DD-MM-YYYY
    const idealDate = date.toLocaleDateString("en-GB").split("/").join("-");

    // define raw metadata
    const rawMeta = {
        "associated to": userId,
        "document title": docTitle,
        "uploaded by": uploadedBy,
        "time of uploading": idealTime,
        "date of uploading": idealDate
    };

    // sanitize keys → replace spaces with hyphens & lowercase
    const safeMeta = {};
    for (const [key, value] of Object.entries(rawMeta)) {
        const safeKey = key.toLowerCase().replace(/\s+/g, "-"); 
        safeMeta[safeKey] = String(value); 
    }
    
    logger.info(`${req.requestId}
            input: ${ userId, docTitle, uploadedBy }
            GET_METADATA was sucessful 
            return: ${JSON.stringify(rawMeta), null, 2}`)

    return safeMeta;
}
