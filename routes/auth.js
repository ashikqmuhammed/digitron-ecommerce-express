const express = require('express');
const router = express.Router();
const authController=require('../controllers/authController')


router.get
    (
    '/',
    authController.getAuth
    )

router.post
    (
    '/password-auth',
    authController.doPasswordAuth
    )

router.post(
    '/otp-auth',
    authController.doOtpAuth
    )

router.get
    (
    '/signup',
    authController.getSignupForm
    )

router.get
    (
    '/vendor-signup/',
    authController.getVendorSignupForm
    )

router.post
    (
    '/signup',
    authController.postSignup
    )

router.get
    (
    '/logout',
    authController.doLogout
    )

router.post
    (
    '/otp',
    authController.sendOtp
    )




module.exports=router