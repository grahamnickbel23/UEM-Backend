import achivementSchema from "../../models/achivementSchema.js";
import AWSServices from "../../utils/aws utils.js";
import localAuth from "../../utils/localAuth utils.js";
import getMetaData from "../../utils/metadata utils.js";

export default class editAchivement{

    // function to edit any achivement
    static async updateDoc(req, res){

        // save all the incoming info fast
        const { id } = req.params;
        const { userId } = req.token;
        const updates = req.body;

        // Whitelist of fields that are allowed to be updated
        const allowedFields = [
            "achivementType",
            "person",
            "title",
            "description",
            "organizer",
            "location",
            "identification_number",
            "currentStatus",
            "eventDate",
            "extra"
        ];

        // cheak if the document esist
        const doesDocExisit = await localAuth.documentAuth(id, res);

        // stop execution if local Auth retunr error
        if (!doesDocExisit) return

        // if all ok go for edit in mongo DB
        Object.keys(updates).forEach(key => {
             if (allowedFields.includes(key)) {
                doesDocExisit[key] = updates[key];
            }
        })

        // save lastUpdatedby
        doesDocExisit.lastUpdatedBy = userId;

        // save doc after updating
        await doesDocExisit.save();

        // return ok after sucess
        return res.status(200).json({
            success: true,
            message: `document updated successfully`
        })
    }

    // function to update main document files
    static async updateImage(req, res){

        // get the incoming info
        const { userId } = req.token;
        const imgURL = req.files
        const { docId, s3Key } = req.body;

        // delete original image
        await AWSServices.deleteAWS(s3Key);

        // get the title from docId
        const data = await achivementSchema.findById(docId);

        // meta data for image
        const metaDataObject = getMetaData(userId, data.title, data.person);

        // update the image 
        const newURL = await AWSServices.uploadAWS('uem-backend/achivement-image/', imgURL, metaDataObject);

        // edit that matching url
    }
}