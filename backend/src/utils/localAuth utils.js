import userSchema from "../models/userSchema.js";
import bcrypt from 'bcrypt';

export default class localAuth{

    // email auth
    static async emailAuth(email, password, res){

        // cheak if the email exisit
        const doesEmailExist = await userSchema.findOne({ emails:email });

        // if not found return error
        if (!doesEmailExist){
            return res.status(404).json({
                success: false,
                message: `user email does not exisit`
            })
        }

        // if all ok cheak password
        const doesPasswordCorrect = await bcrypt.compare(password, doesEmailExist.password);

        // if found incorrect send error
        if (!doesPasswordCorrect){
            return res.status(401).json({
                success: false,
                message: `password was incorrect`
            })
        }

        const userData = doesEmailExist;

        return userData;
    }

    //phone auth
    static async phoneAuth(phone, password, res){
        // cheak if the phone exisit
        const doesPhoneExist = await userSchema.findOne({ phones:phone });

        // if not found return error
        if (!doesPhoneExist){
            return res.status(404).json({
                success: false,
                message: `user phone does not exisit`
            })
        }

        // if all ok cheak password
        const doesPasswordCorrect = await bcrypt.compare(password, doesPhoneExist.password);

        // if found incorrect send error
        if (!doesPasswordCorrect){
            return res.status(401).json({
                success: false,
                message: `password was incorrect`
            })
        }

        const userData = doesPhoneExist;

        return userData;
    }

    //phone auth
    static async employeeIdAuth(employeeId, password, res){
        // cheak if the employeeId exisit
        const doesEmployeeIdExist = await userSchema.findOne({ employeeId:employeeId });

        // if not found return error
        if (!doesEmployeeIdExist){
            return res.status(404).json({
                success: false,
                message: `employeeid does not exisit`
            })
        }

        // if all ok cheak password
        const doesPasswordCorrect = await bcrypt.compare(password, doesEmployeeIdExist.password);

        // if found incorrect send error
        if (!doesPasswordCorrect){
            return res.status(401).json({
                success: false,
                message: `password was incorrect`
            })
        }

        const userData = doesEmployeeIdExist;

        return userData;
    }
}