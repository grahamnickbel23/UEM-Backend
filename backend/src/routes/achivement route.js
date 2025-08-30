import express from 'express';
import upload from '../middelewere/multer security.js';
import wrapperFunction from '../utils/asyncHandeller utils.js';
import achivementController from '../controller/achivement/achivement logic.js';
import editAchivement from '../controller/achivement/editAchivement logic.js';

const route = express.Router();

// get the class
const { asyncHandeller } = wrapperFunction;

// routes for achivement creation
route.post('/creation', upload.fields([

    // multer configaration for multiple file upload
    { name: 'images', maxCount: 10 },
    { name: 'doc', maxCount: 10 },

]),

asyncHandeller(achivementController.docCreation, 'achivement creation'));

// routes for reading achivement
route.post('/read', asyncHandeller(achivementController.docRead, 'getting achivement'));

// route for reading files
route.post("/download", asyncHandeller(achivementController.docPreview, 'getting download from AWS'))

// routes for deleting achivement
route.post('/delete', asyncHandeller(achivementController.docDelete, 'deleting acchivement'));

// routes for doc update
route.post('/update', asyncHandeller(editAchivement.updateDoc, 'updating achivement'));

// routes for image update
route.post('/imgupdate', asyncHandeller(editAchivement.updateImage, 'updating updating image'));

export default route;