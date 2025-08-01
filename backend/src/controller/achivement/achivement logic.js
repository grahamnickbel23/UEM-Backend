import achivementSchema from "../../models/achivementSchema.js";
import localAuth from "../../utils/localAuth utils.js";
import sharp from "sharp";

export default class achivementController {

    // function for achivement doc creation
    static async docCreation(req, res) {

        // get the info first
        const data = req.body;
        const userId = req.token?.userId || data.userId;
        const filePaths = req.files;

        // cheack if the target user even exisit
        const doesUserExisit = await localAuth.userIdAuth(userId, res);

        // stop execution if local auth failed
        if (!doesUserExisit) return

        // // edit image to webp and typical resolution
        // const editedImage = await sharp(filePaths)
        //     .resize(300, 200)
        //     .toFormat('webp')
        //     .toFile('output.webp');

        // if exisit let update info in mongoDB
        const newData = achivementSchema(data);
        await newData.save();

        // return ok if all ok
        return res.status(200).json({
            success: true,
            message: `achivement uploaded successfully`
        })
    }
}