import {Schema, model} from "mongoose";

const otpSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true //making it unique so that only the unique mail gets otp updates and we dont keep adding otps to the same email
    },
    otp:{
        type: Number,
        default: 0
    },
    createdAt:{
        type: Date,
        default: Date.now,
        expires: 600 // 600s i.e 10 mins
    }
})

const OTP = model("Otp", otpSchema)
export default OTP