// we are using nodemailer here since we dont have a custom personal domain to use 'resend' mailer service and its package
import nodemailer from "nodemailer";
import OTP from "../models/otpModel.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.OTP_SERVICE_USER,
    pass: process.env.OTP_SERVICE_PASS,
  },
});

export default async function sendOtpService(email) {
  const otp = Math.floor(1000 + Math.random() * 9000);

  const html = `
    <div style="font-family:sans-serif;">
      <h2>Your OTP is: ${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Storage App" <${process.env.OTP_SERVICE_USER}>`,
      to: email,
      subject: "Storage App OTP",
      html,
    });
    //   console.log("Message sent: %s", info.messageId);

    const otpData = await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true },
    );
    // we are setting createdAt again to a new fresh date and time as soon as we are creating otp/updating the existing (resending otp)
    // upsert is set to true because if the otp exists -> we update it (user resends an otp if earlier expired)
    // or we create a new if older doesn't exists
    // console.log(otpData)
    return { status: "OK", message: "OTP sent!" };
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
}
