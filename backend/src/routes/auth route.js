import express from 'express'
import upload from '../middelewere/multer security.js';
import { asyncHandeller, asyncHandellerPro } from '../utils/asyncHandeller utils.js';
import { userSignup, userLogin } from '../controller/auth/auth logic.js'
import { editUserAuthInfo, editUserInfo } from '../controller/auth/editUserInfo logic.js'

const route = express.Router();

// main user creation and login route
route.post('/signup', upload.fields([
    
    // multer configaration for multiple file upload
    {name:'profile-pic', maxCount: 1}, 
    {name:'id-card', maxCount: 1}]), 

    asyncHandeller(userSignup, 'user creation'));

route.post('/login', asyncHandeller(userLogin, 'user login'));

// user profile update related to auth
route.post('/edit/email', asyncHandellerPro(editUserAuthInfo, 'email', 'updating'));
route.post('/edit/phone', asyncHandellerPro(editUserAuthInfo, 'phone', 'updating'));
route.post('/edit/employeeid', asyncHandellerPro(editUserAuthInfo, 'employeeId', 'updating'));

// user profile update name
route.post('/edit/firstname', asyncHandellerPro(editUserInfo, 'firstName', 'updating'));
route.post('/edit/middlename', asyncHandellerPro(editUserInfo, 'middleName', 'updating'));
route.post('/edit/lastname', asyncHandellerPro(editUserInfo, 'lastName', 'updating'));

// user profile update gender
route.post('/edit/gender', asyncHandellerPro(editUserInfo, 'gender', 'updating'));

// user profile update department
route.post('/edit/department', asyncHandellerPro(editUserInfo, 'department', 'updating'));

// user profile update DOB
route.post('/edit/date_of_birth', asyncHandellerPro(editUserInfo, 'date_of_birth', 'updating'));

// user profile update role
route.post('/edit/role', asyncHandellerPro(editUserInfo, 'role', 'updating'));

// user profile update github link
route.post('/edit/githuburl', asyncHandellerPro(editUserInfo, 'githubURL', 'updating'));

// user profile update linkdin link
route.post('/edit/linkdinurl', asyncHandellerPro(editUserInfo, 'linkdinURL', 'updating'))

export default route