require('dotenv').config()
const nodemailer=require('nodemailer')


//nodemailer stuff
const transporter=nodemailer.createTransport({
    service: "hotmail",
    auth:{
        user: process.env.NODEMAILER,
        pass: process.env.NODE_PASSWORD
    }
})

//testing success
transporter.verify((error,success)=>{
    if(error){
        console.log(error);
    }else{
        console.log('outlook connection established');
    }
})



module.exports={transporter}