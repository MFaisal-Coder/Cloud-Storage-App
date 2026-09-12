import mongoose from "mongoose";
import OTP from "../models/otpModel.js";
import User from "../models/userModel.js";
import Directory from "../models/directoryModel.js";
import loginWithGoogle from "../services/loginWithGoogle.js";
import sendOtpService from "../services/sendOtpService.js";
import Session from "../models/sessionModel.js";
import purify from "../validators/purify.js";
import { loginSchema, emailSchema } from "../validators/zodValidator.js";

export const sendOtpController = async (req, res, next) => {
  try {
    const { email } = req.body;
    const cleanedEmail = purify.sanitize(email);
    const { email: verifiedEmail } = emailSchema.parse({ email: cleanedEmail });

    const resultData = await sendOtpService(verifiedEmail);
    res.status(201).json(resultData);
  } catch (err) {
    next(err);
  }
};

export const verifyOtpController = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const cleanedEmail = purify.sanitize(email);
    const { email: sanitized_email } = emailSchema.parse({
      email: cleanedEmail,
    });
    const otpData = await OTP.findOne({ email: sanitized_email, otp });

    if (!otpData) {
      return res.status(404).json({ error: "OTP expired or invalid" });
    }
    res.status(200).json({ message: "OTP Verified successfully" });
  } catch (err) {
    next(err);
  }
};

export const loginWithGoogleController = async (req, res, next) => {
  const { credential } = req.body;
  const { name, picture, email, sub } = await loginWithGoogle(credential);
  const user = await User.findOne({ email });

  if (user.isDeleted) {
    return res.status(403).json({
      error:
        "You cannot login. Please contact your system admin for more info.",
    });
  }

  const mongooseSession = await mongoose.startSession();

  if (!user) {
    try {
      const userId = new mongoose.Types.ObjectId();
      const dirId = new mongoose.Types.ObjectId();

      await mongooseSession.startTransaction();

      const directoryCollection = await Directory.insertOne(
        {
          _id: dirId,
          name: `root-${email}`,
          parentDirId: null,
          userId,
        },
        { mongooseSession },
      );

      const userCollection = await User.insertOne(
        {
          _id: userId,
          name,
          email,
          picture,
          rootDirId: dirId, //added after creating objectID (NEW)
        },
        { mongooseSession },
      );

      const newSession = await Session.create({ userId: userId });

      res.cookie("sid", newSession.id, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
        sameSite: "lax",  //although chrome's default value sets to LAX, I'm explicitly saving it to LAX here to avoid CSRF 
        secure: true,
        signed: true,
      });

      await mongooseSession.commitTransaction();

      res.status(201).json({ message: "User Registered" });
    } catch (err) {
      next(err);
    } finally {
      mongooseSession.endSession();
    }
  } else {
    const newSession = await Session.create({ userId: user.id });
    const allActiveSessions = await Session.find({ userId: user.id });

    if (allActiveSessions.length >= 3) {
      await allActiveSessions[0].deleteOne();
    }

    if (user.picture.includes("cdn-icons-png.flaticon.com")) {
      user.picture = picture;
      user.save();
    }

    res.cookie("sid", newSession.id, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      sameSite: "lax",
      secure: true,
      signed: true,
    });
    res.status(200).json({ message: "User Logged In." });
  }
};
