require('../config/connection')
require('dotenv').config()
const User=require('../models/user')
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken);
const bcrypt=require('bcrypt')
const mailer=require('../helpers/functions/email')
const Otp=require('../models/otp')




//getting authentication page

const getAuth=(req,res)=>{
    if(req.session.userData){
        const {role}=req.session.userData

        if(role==='customer'){
            res.redirect('/')
        }
        if(role==='vendor'){
            res.redirect('/vendor')
        }
        if(role==='admin'){
            res.redirect('/admin')
        }
    }
    res.render
    (
        'auth/password-auth',
        {
            layout:'auth-layout',
            wrongPassword,
            wrongUser,
            pendingVendor,
            blockedVendor,
            title:'hexashop|login'
        }
    )
wrongPassword=false
wrongUser=false
pendingVendor=false
blockedVendor=false 
}



//password authentication

let wrongPassword=false
let wrongUser=false
let pendingVendor=false
let blockedVendor=false

const doPasswordAuth=async(req,res,next)=>{
    try {
        const {email}=req.body
        const userData=await User.findOne({email:email})
    
        if (!userData){
            wrongUser=true
            res.redirect('/auth')
        }
        if(userData.verified===false){
            pendingVendor=true
            res.redirect('/auth')
        }
        if(userData.blocked){
            blockedVendor=true
            res.redirect('/auth')
        }
    
    const isPassword = await userData.authenticate(req.body.password);
    
        if(!isPassword){
            wrongPassword=true
            res.redirect('/auth')
        }
        if(userData&&isPassword&&userData.twoFAuth){
            req.session.tempData=userData
            console.log(userData);
            client.verify.services(process.env.TWILIO_SERVICE_SID)
                 .verifications
                 .create({to: `+91${userData.mobileNumber}`, channel: 'sms'})
                 .then(()=>{
                    res.render('auth/otp-auth',{layout:'auth-layout',title:'hexashop:otp'})
                 });
        
        }
        if(userData&&isPassword&&!userData.twoFAuth){
            req.session.userData=userData
            if (userData.role === "admin") {
                res.redirect('/admin')
            }
            if(userData.role === "vendor"){
                res.redirect('/vendor')
            }
            if(userData.role==='customer'){
                res.redirect('/')
            }
        }  
    } catch (error) {
        next(error)
    }
}



//otp authentication
var otpErr=false
const doOtpAuth=(req,res,next)=>{
    try {
        const userData=req.session.tempData

        client.verify.services(process.env.TWILIO_SERVICE_SID).verificationChecks.create({
            to: `+91${userData.mobileNumber}`,
            code: req.body.otp
        })
        .then(async(verification)=>{
    console.log(verification);
    
            if(!verification){
                otpErr=true
                res.render('auth/otp-auth',{layout:'auth-layout',title:'hexashop:otp',otpErr})
                otpErr=false
            }
            if(verification){
                req.session.userData=userData
                req.session.tempData=null
            }
            if (verification&&userData.role === "admin") {
                res.redirect('/admin')
            }
            if(verification&&userData.role === "vendor"){
                res.redirect('/vendor')
            }
            if(verification&&userData.role==='customer'){
                res.redirect('/')
            }
        })  
    } catch (error) {
        next(error)
    }
}



//getting signup form



const getSignupForm=(req,res)=>{
    if(req.session.userData){
        const {role}=req.session.userData

        if(role==='customer'){
            res.redirect('/')
        }
        if(role==='vendor'){
            res.redirect('/vendor')
        }
        if(role==='admin'){
            res.redirect('/admin')
        }
    }
    res.render
    (
        'auth/customer-signup-form',
        {
            layout:'auth-layout',
            customerExist,
            title:'hexashop|login'
        }
    )
    customerExist=false
}

const getVendorSignupForm=(req,res)=>{

    res.render('auth/vendor-signup-form',{layout:'auth-layout',vendorExist,vendorReq})
    vendorExist=false
    vendorReq=false

}

let vendorExist=false
let customerExist=false

//verify email during signup
const sendOtp=async(req,res,next)=>{
    try {
        req.session.tempData=req.body
        const {email}=req.body
        const userData=await User.findOne({email:email})
       
        if(userData){
            if (userData.role==='vendor'){
                vendorExist=true
                res.redirect('/auth/vendor-signup')
            }else{
                customerExist=true
                res.redirect('/auth/signup')
            }
        }
        if(!userData){
            //otp generating
            function generateRandomNumber() {
                const minm = 1000;
                const maxm = 9999;
                return Math.floor(Math
                .random() * (maxm - minm + 1)) + minm;
            }
            const otp = generateRandomNumber();
            console.log(otp);
            var hashedOtp=await bcrypt.hash(`${otp}`,10)
            //expiry generating
            const currentDate = new Date();
            const expiryAt = new Date(currentDate.getTime() + 10*60000);
            const otpData=await Otp.create({hashedOtp:hashedOtp,expiryAt:expiryAt})
            req.session.otpId=otpData._id
    
            const subject= "DIGITRON: Verify your Email"
            const content=`Your OTP is ${otp}. Expires in 10 minutes`
            await mailer.sendEmail(email,subject,content)
            res.render('auth/email-otp-auth',{layout:'auth-layout',title:'DIGITRON | OTP'})
            
        } 
    } catch (error) {
        next(error)
    }
}

//post signup form

let vendorReq=false
const postSignup=async(req,res,next)=>{
    try {
        console.log(req.session.tempData);
        console.log(req.session.otpId);
        const otpId=req.session.otpId
       
    
        const otpData=await Otp.findOne({_id:otpId})
            if(otpData.length<=0){
              //no otp record found
              res.render('auth/email-otp-auth',{wrongVerId:true})
              wrongVerId=false;
            }else{
              //otp record found
              const {expiryAt,hashedOtp}=otpData
              if(expiryAt< Date.now()){
                //otp record has expired
                res.render('auth/email-otp-auth',{otpExpired:true})
                otpExpired=false
                await Otp.deleteMany({otpId})
              }else{
                //otp on time

                const otp=`${req.body.first}${req.body.second}${req.body.third}${req.body.fourth}`
                console.log(otp);
                const validOtp=await bcrypt.compare(otp,hashedOtp)
      
                if(!validOtp){
                  //wrong otp input
                  res.render('auth/email-otp-auth',{invalidOtp:true})
                  invalidOtp=true
                }else{
                  const {fullName,email,password,vendor}=req.session.tempData
                
                //   new user signup
                const hashedPassword=await bcrypt.hash(password,10)
                const userObj={
                    fullName:fullName,
                    email:email,
                    hashedPassword:hashedPassword,
                }
                if(vendor==='true'){
                    userObj.role='vendor'
                    userObj.verified=false
                }
                User.create(userObj)
                .then(()=>{
                return User.findOne({email:email})
                })
                .then((userData)=>{
                
                    if(userData.role==='vendor'){
                        vendorReq=true
                        res.redirect('/auth/vendor-signup')
                    }else{
                        req.session.userData=userData
                        res.redirect('/')
                    }
                })
                .catch((e)=>{
                    console.log(e);
                })
                await Otp.deleteMany({_Id:otpId})
                }
            }
        }
    } catch (error) {
        next(error)
    }
}



//logout
const doLogout=(req,res)=>{
    req.session.destroy()
    res.redirect('/auth')
}

module.exports={
    getAuth,
    doPasswordAuth,
    doOtpAuth,
    getSignupForm,
    postSignup,
    getVendorSignupForm,
    doLogout,sendOtp
}


