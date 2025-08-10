import express from 'express';
import upload from '../middelewere/multer security.js';
import { asyncHandeller } from '../utils/asyncHandeller utils.js';
import achivementController from '../controller/achivement/achivement logic.js';
import editAchivement from '../controller/achivement/editAchivement logic.js';
import acessTokenCheak from '../middelewere/acessTokenCheak secure.js';

const route = express.Router();

// routes for achivement creation
route.post('/creation', upload.fields([

    // multer configaration for multiple file upload
    { name: 'images', maxCount: 10 },
    { name: 'doc', maxCount: 10 },

]),

asyncHandeller(acessTokenCheak, 'acess Token Cheak'),
asyncHandeller(achivementController.docCreation, 'achivement creation'));

// routes for reading achivement
route.post('/read', asyncHandeller(acessTokenCheak, 'acess Token Cheak'),
    asyncHandeller(achivementController.docRead, 'getting achivement'));

// routes for deleting achivement
route.post('/delete', asyncHandeller(acessTokenCheak, 'acess Token Cheak'),
    asyncHandeller(achivementController.docDelete, 'deleting acchivement'));

// routes for doc update
route.post('/update', asyncHandeller(acessTokenCheak, 'acess Token Cheak'),
    asyncHandeller(editAchivement.updateDoc, 'updating achivement'));

// routes for image update
route.post('/imgupdate', asyncHandeller(acessTokenCheak, 'acess Token Cheak'),
    asyncHandeller(editAchivement.updateImage, 'updating updating image'));

export default route;