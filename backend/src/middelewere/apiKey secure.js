import genaralResponse from "../utils/genaralResponse utils.js";

export default async function apiKey(req, res, next){

    // get the api keys
    const clientKey = req.header("api-key");
    const serverKey = process.env.API_KEY; 

    // cheal api keys
    if (clientKey === serverKey){
        return next();
    }

    genaralResponse.genaral400Error(
        (clientKey != serverKey) || (clientKey == null) ,
        'provide correct api key',
        res
    )
}