require('dotenv').config()
const mailerConnection=require('../../config/mailer-connection')



// send otp verification email
const sendEmail=async (to,subject,content)=>{
    try {
        

        //mailoptions
        const mailOptions={
            from:process.env.NODEMAILER,
            to:to,
            subject:subject,
            text:content
        }

        await mailerConnection.transporter.sendMail(mailOptions)
      
    }catch (error) {

       console.log(error); 

    }
   
}  


module.exports={sendEmail}