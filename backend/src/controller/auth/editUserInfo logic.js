import userSchema from "../../models/userSchema.js";
import localAuth from "../../utils/localAuth utils.js";

export default class editUserInfo {

    // genaral edit function for auth info
    static async editUserAuthInfo(fieldName, req, res){

        // get the local auth info
        const { oldInfo, newInfo, password } = req.body;

        const localAuthInfo = { [fieldName] : oldInfo };

        // cheak if local user exist
        const userData = await localAuth.genaralAuth(localAuthInfo, password, res);

        // if auth failed stop here
        if(!userData) return

        // get the info to be edited
        const updatedInfo = { [fieldName] : newInfo }

        //update info in database
        await userSchema.findByIdAndUpdate( userData._id, updatedInfo);

        // return ok if all ok
        return res.status(200).json({
            success: true,
            message: `${fieldName} updated successfully`
        })
    }

    // genaral edit function for other info
    static async editUserInfo( fieldName, req, res){
        
        // get info for local auth
        const { newInfo } = req.body;
        const { userId } = req.token;

        // cheak if local user exisit
        const userData = await localAuth.userIdAuth(userId, res);

        // if auth failed, stopped here
        if(!userData) return

        // get info for update
        const updatedInfo = { [fieldName] : newInfo};

        // update info in database
        await userSchema.findByIdAndUpdate( userId, updatedInfo );

        // return ok if all ok
        return res.status(200).json({
            success: true,
            message: `${fieldName} updated successfully`
        })
    }
}