const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    hashedOtp: {type:String, required: true},
    expiryAt: {type:Date, required:true}
}, { timestamps: true });


module.exports = mongoose.model('Otp', otpSchema);