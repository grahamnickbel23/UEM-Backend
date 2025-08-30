import express from 'express';
import upload from '../middelewere/multer security.js';
import wrapperFunction from '../utils/asyncHandeller utils.js';
import otpVerification from '../controller/auth/otpVerification logic.js';
import jwtPerser from '../middelewere/jwtPerser secure.js';
import otpVerify from '../middelewere/otpVerify secure.js';
import secureAuth from '../middelewere/editAuth secure.js';
import admin from '../middelewere/adminAuth secure.js';
import userAuth from '../controller/auth/auth logic.js';
import editAuth from '../controller/auth/editAuth logic.js';

const route = express.Router();

// get the function from class
const { asyncHandeller } = wrapperFunction;
const { userSignup, requestLogin, userLogin, allInfoForUserProfile, acessTokenIssue } = userAuth;
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

// get the user data after login
route.post('/profile', jwtPerser.jwtWrapper("access_token", "info"),
    asyncHandeller(allInfoForUserProfile, 'getting user profile info'))

// issue acesstoken from refresh token
route.post("/token", jwtPerser.jwtWrapper('login_refresh_token', 'token'), 
    asyncHandeller(acessTokenIssue, 'acesstoken issue via refresh token'));

// get otp
route.post("/getotp", asyncHandeller(otpVerification.sendOTP, "send otp via email"));

// verify otp
route.post("/verifyotp", asyncHandeller(otpVerification.verifyOTP, " verify otp and send token"))

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