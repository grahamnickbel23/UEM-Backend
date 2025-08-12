import express from 'express'
import wrapperFunction from '../utils/asyncHandeller utils.js';
import editGenaralInfo from '../controller/auth/editUserInfo logic.js';
import acessTokenCheak from '../middelewere/acessTokenCheak secure.js';
import adminCheak from '../middelewere/adminCheak secure.js';

const route = express.Router();

// get the class
const { asyncHandeller, asyncHandellerPro } = wrapperFunction;
const { editUserAuthInfo, editUserInfo } = editGenaralInfo;

// user profile update related to auth
route.post('/edit/email', asyncHandeller(acessTokenCheak, 'acess Token Cheak'), 
    asyncHandeller(adminCheak,  'admin Cheak'),
    asyncHandellerPro(editUserAuthInfo, 'email', 'updating'));

route.post('/edit/phone', asyncHandeller(acessTokenCheak, 'acess Token Cheak'), 
    asyncHandeller(adminCheak,  'admin Cheak'),
    asyncHandellerPro(editUserAuthInfo, 'phone', 'updating'));

route.post('/edit/employeeid', asyncHandeller(acessTokenCheak, 'acess Token Cheak'), 
    asyncHandeller(adminCheak,  'admin Cheak'),
    asyncHandellerPro(editUserAuthInfo, 'employeeId', 'updating'));

// user profile update name
route.post('/edit/firstname', asyncHandeller(acessTokenCheak, 'acess Token Cheak'), 
    asyncHandellerPro(editUserInfo, 'firstName', 'updating'));

route.post('/edit/middlename', asyncHandeller(acessTokenCheak, 'acess Token Cheak'), 
    asyncHandellerPro(editUserInfo, 'middleName', 'updating'));

route.post('/edit/lastname', asyncHandeller(acessTokenCheak, 'acess Token Cheak'), 
    asyncHandellerPro(editUserInfo, 'lastName', 'updating'));

// user profile update gender
route.post('/edit/gender', asyncHandeller(acessTokenCheak, 'acess Token Cheak'), 
    asyncHandellerPro(editUserInfo, 'gender', 'updating'));

// user profile update department
route.post('/edit/department', asyncHandeller(acessTokenCheak, 'acess Token Cheak'), 
    asyncHandellerPro(editUserInfo, 'department', 'updating'));

// user profile update DOB
route.post('/edit/date_of_birth', asyncHandeller(acessTokenCheak, 'acess Token Cheak'), 
    asyncHandellerPro(editUserInfo, 'date_of_birth', 'updating'));

// user profile update role
route.post('/edit/role', asyncHandeller(acessTokenCheak, 'acess Token Cheak'), 
    asyncHandellerPro(editUserInfo, 'role', 'updating'));

// user profile update github link
route.post('/edit/githuburl', asyncHandeller(acessTokenCheak, 'acess Token Cheak'), 
    asyncHandellerPro(editUserInfo, 'githubURL', 'updating'));

// user profile update linkdin link
route.post('/edit/linkdinurl', asyncHandeller(acessTokenCheak, 'acess Token Cheak'), 
    asyncHandellerPro(editUserInfo, 'linkdinURL', 'updating'))

export default route