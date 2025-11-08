import genaralResponse from "../utils/genaralResponse utils.js";
import logger from "../logger/log logger.js";

export default async function secureAuth(req, res, next){

    /*  cheak if the user trying to edit otp dependent path using
    non otp depedent path */

    const { fieldName } = req.body;
    const prohibitedList = ["email", "phone", "password", "employeeId", "role"]

    // Check if fieldName starts with any prohibited field
    const isProhibited = prohibitedList.some(
        (prohibited) => fieldName === prohibited || fieldName.startsWith(prohibited + ".")
    );

    /* we could have done with just if(prohibitedList.include(fieldName)) but
    issue with that will be request like this email.0 or phone.1.countrycode
    would slip through */

    // genarate log after sucessful execution
    logger.info(`${req.requestId} 
        input: ${ fieldName } 
        EDIT_AUTH sucessful`);
    
    const info = "OTP verification required for this edit";
    genaralResponse.genaral400Error(isProhibited, info, res);
    if(isProhibited) return

    // call next middelewere
    next();
}