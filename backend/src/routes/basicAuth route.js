import express from 'express'
import upload from '../middelewere/multer security.js';
import { asyncHandeller } from '../utils/asyncHandeller utils.js';
import { userSignup, userLogin } from '../controller/auth/auth logic.js'
import acessTokenCheak from '../middelewere/acessTokenCheak secure.js';
import adminCheak from '../middelewere/adminCheak secure.js';

const route = express.Router();

// main user creation and login route
route.post('/signup', upload.fields([
    
    // multer configaration for multiple file upload
    {name:'profile-pic', maxCount: 1}, 
    {name:'id-card', maxCount: 1}]), 

    asyncHandeller(acessTokenCheak, 'acess Token Cheak'), 
    asyncHandeller(adminCheak, 'admin Cheak'),
    asyncHandeller(userSignup, 'user creation'));

route.post('/login', asyncHandeller(userLogin, 'user login'));

export default route