export default class wrapperFunction{

    // wrapper function to avoid repeted use of try catch
    static asyncHandeller = (fnc, perpous) => async (req, res, next) => {
        try{
            await fnc(req, res, next);
        }catch (err){
            return res.status(500).json({
                success: false,
                message: `error in ${perpous}`,
                error: err
            })
        }
    }

    // another for function with additionl argument
    static asyncHandellerPro = (fnc, fieldName, perpous) => async (req, res, next) => {
        try{
            await fnc(req, res, next);
        }catch (err){
            return res.status(500).json({
                success: false,
                message: `error in ${perpous} ${fieldName}`,
                error: err
            })
        }
    }
}