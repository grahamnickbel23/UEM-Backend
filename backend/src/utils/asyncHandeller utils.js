import logger from "../logger/log logger.js";

export default class wrapperFunction{

    // wrapper function to avoid repeted use of try catch
    static asyncHandeller = (fnc, perpous) => async (req, res, next) => {
        try{
            await fnc(req, res, next);
        }catch (err){

        // genarate log after sucessful execution
        logger.error(`${req.requestId} error: ${err}`)


            return res.status(500).json({
                success: false,
                message: `error in ${perpous}`,
                error: err.message
            })
        }
    }

    // another for function with additionl argument
    static asyncHandellerPro = (fnc, fieldName, perpous) => async (req, res, next) => {
        try{
            await fnc(req, res, next);
        }catch (err){

        //genarate log after sucessful execution
        logger.error(`${req.requestId} function Name: ${fnc} error: ${err}`)

        
            return res.status(500).json({
                success: false,
                message: `error in ${perpous} ${fieldName}`,
                error: err.message
            })
        }
    }
}