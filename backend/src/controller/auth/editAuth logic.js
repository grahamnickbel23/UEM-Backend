import userSchema from "../../models/userSchema.js";
import localAuth from "../../utils/localAuth utils.js";

export default class editUserAuth{

    // edit email
    static async editUerEmail(req, res){

        // get the data
        const { oldEmail, newEmail, password } = req.body;

        // cheak if local user exisit
        const userData = await localAuth.emailAuth(oldEmail, password, res);

        // if all ok edit the user
        await userSchema.findByIdAndUpdate(
            userData._id,
            { emails: newEmail }
        )

        // return ok if all ok
        return res.status(200).json({
            success: true,
            message: `email edited successfully`
        })
    }

    // edit phone
    static async editUserPhone(req, res){

        // get the data
        const { oldPhone, newPhone, password } = req.body;

        // cheak if local user exisit
        const userData = await localAuth.phoneAuth(oldPhone, password, res);

        // if all ok edit the user
        await userSchema.findByIdAndUpdate(
            userData._id,
            { phones: newPhone }
        )

        // return ok if all ok
        return res.status(200).json({
            success: true,
            message: `phone edited successfully`
        })
    }

    // edit employee id
    static async editEmployeeId(req, res){

        // get the data
        const { oldEmployeeId, newEmployeeId, password } = req.body;

        // cheak if local user exisit
        const userData = await localAuth.employeeIdAuth(oldEmployeeId, password, res);

        // if all ok edit user
        await userSchema.findByIdAndUpdate(
            userData._id,
            { employeeId: newEmployeeId }
        )

        // return ok if all ok
        return res.status(200).json({
            success: true,
            message: `employee id updated successfully`
        })
    }
}