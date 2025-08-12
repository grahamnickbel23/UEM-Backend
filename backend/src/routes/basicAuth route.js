import express from 'express'
import upload from '../middelewere/multer security.js';
import wrapperFunction from '../utils/asyncHandeller utils.js';
import localAuth from '../utils/localAuth utils.js';
import acessTokenCheak from '../middelewere/acessTokenCheak secure.js';
import adminCheak from '../middelewere/adminCheak secure.js';

const route = express.Router();

// get the class
const { asyncHandeller } = wrapperFunction;
const { userSignup, userLogin } = localAuth;

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