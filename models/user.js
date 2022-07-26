const mongoose = require('mongoose')
const bcrypt=require('bcrypt')

const userSchema = new mongoose.Schema(
    {
      fullName: {
        type: String,
        required: true,
        trim: true,
        min: 3,
        max: 20,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
      },
      mobileNumber: { 
        type: Number
      },
      hashedPassword: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        enum: ["admin", "vendor","customer"],
        default: "customer",
      },
      verified: {
        type: Boolean,
        default:true
      },
      blocked: {
        type: Boolean,
        default:false
      },
      twoFAuth: {
        type: Boolean,
        default:false
      }

    },
    { timestamps: true }
  );



  // userSchema.virtual('password').set(function(password) {

  //   this.hashedPassword= bcrypt.hashSync(password,10);

  // })




  userSchema.methods={

    authenticate: function(password) {

       return bcrypt.compareSync(password, this.hashedPassword)

    }
  }

module.exports=mongoose.model("User",userSchema)