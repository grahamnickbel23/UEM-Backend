import express from 'express'
import upload from '../middelewere/multer security.js';
import wrapperFunction from '../utils/asyncHandeller utils.js';
import userAuth from '../controller/auth/auth logic.js'
import editUserInfo from '../controller/auth/editUserInfo logic.js'

const route = express.Router();

// main user creation and login route
route.post('/signup', upload.fields([{name:'profile pic', maxCount: 1}, {name:'id card', maxCount: 1}]), wrapperFunction.asyncHandeller(userAuth.userSignup, 'user creation'));
route.post('/login', wrapperFunction.asyncHandeller(userAuth.userLogin, 'user login'));

// user profile update related to auth
route.post('/edit/email', wrapperFunction.asyncHandellerPro(editUserInfo.editUserAuthInfo, 'email', 'updating'));
route.post('/edit/phone', wrapperFunction.asyncHandellerPro(editUserInfo.editUserAuthInfo, 'phone', 'updating'));
route.post('/edit/employeeid', wrapperFunction.asyncHandellerPro(editUserInfo.editUserAuthInfo, 'employeeId', 'updating'));

// user profile update name
route.post('/edit/firstname', wrapperFunction.asyncHandellerPro(editUserInfo.editUserInfo, 'firstName', 'updating'));
route.post('/edit/middlename', wrapperFunction.asyncHandellerPro(editUserInfo.editUserInfo, 'middleName', 'updating'));
route.post('/edit/lastname', wrapperFunction.asyncHandellerPro(editUserInfo.editUserInfo, 'lastName', 'updating'));

// user profile update gender
route.post('/edit/gender', wrapperFunction.asyncHandellerPro(editUserInfo.editUserInfo, 'gender', 'updating'));

// user profile update department
route.post('/edit/department', wrapperFunction.asyncHandellerPro(editUserInfo.editUserInfo, 'department', 'updating'));

// user profile update DOB
route.post('/edit/date_of_birth', wrapperFunction.asyncHandellerPro(editUserInfo.editUserInfo, 'date_of_birth', 'updating'));

// user profile update role
route.post('/edit/role', wrapperFunction.asyncHandellerPro(editUserInfo.editUserInfo, 'role', 'updating'));

// user profile update github link
route.post('/edit/githuburl', wrapperFunction.asyncHandellerPro(editUserInfo.editUserInfo, 'githubURL', 'updating'));

// user profile update linkdin link
route.post('/edit/linkdinurl', wrapperFunction.asyncHandellerPro(editUserInfo.editUserInfo, 'linkdinURL', 'updating'))

export default route