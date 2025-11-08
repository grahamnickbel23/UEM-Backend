import express from 'express';
import upload from '../middelewere/multer security.js';
import wrapperFunction from '../utils/asyncHandeller utils.js';
import otpVerification from '../controller/auth/otpVerification logic.js';
import search from '../controller/admin/search logic.js';
import download from '../controller/admin/download logic.js';
import jwtPerser from '../middelewere/jwtPerser secure.js';
import otpVerify from '../middelewere/otpVerify secure.js';
import secureAuth from '../middelewere/editAuth secure.js';
import admin from '../middelewere/adminAuth secure.js';
import userAuth from '../controller/auth/auth logic.js';
import editAuth from '../controller/auth/editAuth logic.js';
import adminControl from '../controller/admin/admin logic.js';

const route = express.Router();

// get the function from class
const { asyncHandeller, asyncHandellerParameter } = wrapperFunction;
const { userSignup, requestLogin, userLogin, allInfoForUserProfile, profilePicDownload, userLogout, acessTokenIssue } = userAuth;
const { getInfoForOtherUser, otherPicDownload, provideNginxConcent, isItAdminToken, isOtpTokenThere } = adminControl;
const { genaralAuth, adminAuth, recoveryAuth } = editAuth;

// admin based user signup
route.post("/signup", upload.fields([

    // multer configaration for single file upload
    { name: 'profileImage', maxCount: 1 },
    { name: 'idCard', maxCount: 1 }

]),

    jwtPerser.jwtWrapper("access_token", "info"), 
    asyncHandeller(admin.adminAuth, 'admin auth middelewere'),
    asyncHandeller(userSignup, "user creation"));

// request login
route.post("/requestlogin", asyncHandeller(requestLogin, "request login"));

// main login
route.post("/signin", asyncHandeller(userLogin, "user login"));

// request logout
route.post("/signout", jwtPerser.jwtWrapper("access_token", "info"),
    asyncHandeller(userLogout, 'remove jwt token for logout'))

// get the user data after login
route.post('/profile', jwtPerser.jwtWrapper("access_token", "info"),
    asyncHandeller(allInfoForUserProfile, 'getting user profile info'))

// get the user profile pic
route.get('/profilepic', jwtPerser.jwtWrapper("access_token", "info"),
    asyncHandellerParameter(profilePicDownload, 'downloading user profile pic')('profilePicURL'))

// get the id card pic
route.get('/idcardpic', jwtPerser.jwtWrapper("access_token", "info"),
    asyncHandellerParameter(profilePicDownload, 'downloading user idcard pic')('idCardUrl'))




// search users (acess only to admin)
route.post('/search', jwtPerser.jwtWrapper("access_token", "info"),
    asyncHandeller(admin.adminAuth, 'admin auth middelewere'),
    asyncHandeller(search.searchUser, 'getting user profile info via search'))

// get all other user (acess only to admin)
route.post("/alluser", jwtPerser.jwtWrapper("access_token", "info"),
    asyncHandeller(admin.adminAuth, 'admin auth middelewere'),
    asyncHandeller(search.getAllUser, 'getting user profile info'))

// get all deleted user (acess only to admin)
route.post("/deleteduser", jwtPerser.jwtWrapper("access_token", "info"),
    asyncHandeller(admin.adminAuth, 'admin auth middelewere'),
    asyncHandeller(search.getAllDeletedUser, 'getting deleted user profile'))

// get other user's data (acess only to admin)
route.post('/anyprofile', jwtPerser.jwtWrapper("access_token", "info"),
    asyncHandeller(admin.adminAuth, 'admin auth middelewere'),
    asyncHandeller(getInfoForOtherUser, 'getting user profile info'))

// get all other user's profile pics (acess only to admin)
route.get("/anyprofilepic", jwtPerser.jwtWrapper("access_token", "info"),
    asyncHandeller(admin.adminAuth, 'admin auth middelewere'),
    asyncHandellerParameter(otherPicDownload, 'getting other user profile pic')('profilePicURL'))

// get all other user's id card (acess only to admin)
route.get("/anyidcard", jwtPerser.jwtWrapper("access_token", "info"),
    asyncHandeller(admin.adminAuth, 'admin auth middelewere'),
    asyncHandellerParameter(otherPicDownload, 'getting other user profile pic')('idCardUrl'))






// cheak if acesstoken has admin acess
route.post("/admincheak", jwtPerser.jwtWrapper("access_token", "info"),
    asyncHandeller(isItAdminToken, 'cheaking if acess token belong to admin'))

// issue acesstoken from refresh token
route.post("/token", jwtPerser.jwtWrapper('login_refresh_token', 'token'), 
    asyncHandeller(acessTokenIssue, 'acesstoken issue via refresh token'));

// internal api call from nginx to protect frontend pages
route.post('/admincheak', jwtPerser.jwtWrapper("access_token", "info"),
    asyncHandeller(admin.adminAuth, 'admin auth middelewere'),
    asyncHandeller(provideNginxConcent, 'providing nginx concent'))





// get otp
route.post("/getotp", asyncHandeller(otpVerification.sendOTP, "send otp via email"));

// verify otp
route.post("/verifyotp", asyncHandeller(otpVerification.verifyOTP, " verify otp and send token"))

// verify if otp token is there
route.post("/verifyotptoken", jwtPerser.jwtWrapper("otp_token", "token"), 
    asyncHandeller(isOtpTokenThere, "cheaking is browser has otp token"));





// dwonalod excelsheet (acess only to admin)
route.post("/downloaduser", jwtPerser.jwtWrapper("access_token", "info"),
    asyncHandeller(admin.adminAuth, 'admin auth middelewere'),
    asyncHandeller(download.downloadExcel, 'getting all user profile info'))

// download achivement as pdf
route.post("/downloadachivement", jwtPerser.jwtWrapper("access_token", "info"),
    asyncHandeller(download.downloadAchievement, 'getting user achivement info in pdf'))




// high security auth
route.post("/edit/highauth", jwtPerser.jwtWrapper("otp_token", "token"), asyncHandeller(otpVerify, "otp verification"), 
    asyncHandeller(genaralAuth, "high security auth"));

// low security auth
route.post("/edit/lowauth", asyncHandeller(secureAuth, "securing auth of otp auth through low security auth"), 
   asyncHandeller(genaralAuth, "low security auth"));

// admin auth admin power to edit userschema
route.post("/edit/adminauth", asyncHandeller(admin.adminAuthLogic, 'admin auth middelewere'),
   asyncHandeller(adminAuth, "editing schema with admin privilage"));

// admin auth prower to recover deleted useraccount
route.post("/edit/recoveryauth", asyncHandeller(admin.adminAuthLogic, 'admin auth middelewere'),
   asyncHandeller(recoveryAuth, "getting back deleted account"))


export default route;