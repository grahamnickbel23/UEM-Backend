import userSchema from "../../models/userSchema.js";
import genaralResponse from "../../utils/genaralResponse utils.js";
import sendEmail from "../notification/send email.js";
import emailUpdate from "../../utils/emailUpdate utils.js";
import admin from "../../middelewere/adminAuth secure.js";
import bcrypt from 'bcrypt';
import localAuth from "../../utils/localAuth utils.js";

export default class editAuth {

    // function for genaral Auth

    /* high security auth fuction is for editing personally identifiable info
    like email, phone, password and employee id and low security function is 
    for other filed to be edited but logic is same for both so here is the logic 
    part of that, route part is handelled from route section*/

    static async genaralAuth(req, res) {

        // get the info 1st
        const data = req.profile ?? await userSchema.findById(req.info.userId);
        const { fieldName, info } = req.body;
        const userid = data._id;

        // updatable info pair
        let updatedInfo = { [fieldName]: info };

        // hash info if filedame is password
        if (fieldName == 'password') {
            const hashedPassword = await bcrypt.hash(info, 10);
            updatedInfo = { [fieldName]: hashedPassword }
        };

        // cheak for admin if fieldname is role
        if (fieldName === 'role'){
            const result = await admin.adminAuthLogic(req, res);
            if (!result) return;
        }

        // as user exisit do the chnage
        const doesUpdateSuccesful = await userSchema.findByIdAndUpdate(
            userid, updatedInfo, { new: true });

        //send email if update was succesful
        if (fieldName != 'password') {

            if (doesUpdateSuccesful[fieldName] == info) {
                await sendEmail.alertEmailUpdate(data.email, fieldName);
            };

        } else {

            if (doesUpdateSuccesful.password != data.password) {
                await sendEmail.alertEmailUpdate(data.email, fieldName);
            };

        }

        /* here we are alawyes using the old email to response so that even if email
        get changed the riply go to the older email, as this let user aware
        againt any attack or unauthorised email chnages */

        // return ok if all ok
        const response = `${fieldName} updated sucessfully`
        genaralResponse.genaral200Response(response, res);
    }

    // function for admin Auth
    static async adminAuth(req, res) {

        /* admin can use any identifiable info to delete an user like email, phone or
        employee id */

        const userInfo = await localAuth.doesUserExisit(req, "body");
        const adminInfo = await localAuth.doesUserExisit(req, "info");

        /* here we are soft deleting user and would retain all related info for 1 week, if not re used
        we will use a background job to delete that fully*/

        // deleted the user
        const deletedUser = await userSchema.findByIdAndUpdate(
            userInfo._id,
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        // return error if not deleted properly
        genaralResponse.genaral400Error(
            deletedUser.isDeleted && deletedUser.deletedAt, "failed to delete an user", res);
        if (deletedUser.isDeleted && deletedUser.deletedAt) return;

        // send email to the deleted user and admin
        await emailUpdate.deletedAccountUpdate(userInfo.email[0], adminInfo.email[0]);

        // return on if all ok
        genaralResponse.genaral200Response("user info moved to recycle bin", res);
    }

    // function to recover deleted account
    static async recoveryAuth(req, res) {

        // get the user info from acess token
        const { userId } = req.info;

        // check if the user is actually deleted
        const deletedUser = await userSchema.findById(userId);
        if (!deletedUser || !deletedUser.isDeleted) {
            return genaralResponse.genaral400Error(true, "User is not marked as deleted", res);
        }

        // restore the user
        const recoveredUser = await userSchema.findByIdAndUpdate(
            userId,
            { isDeleted: false, deletedAt: null },
            { new: true }
        );

        // check if recovery was successful
        genaralResponse.genaral400Error(
            recoveredUser.isDeleted,
            "Failed to recover user account",
            res
        );
        if (recoveredUser.isDeleted) return;

        // return success
        genaralResponse.genaral200Response("User account successfully recovered", res);
    }
}