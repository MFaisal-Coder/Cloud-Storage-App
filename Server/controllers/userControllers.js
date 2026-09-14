import mongoose from "mongoose";
import Directory from "../models/directoryModel.js";
import Session from "../models/sessionModel.js";
import User from "../models/userModel.js";
import purify from "../validators/purify.js";
import { emailSchema, registerSchema } from "../validators/zodValidator.js";

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const sanitizedName = purify.sanitize(name);
    const sanitizedEmail = purify.sanitize(email);
    const sanitizedPassword = purify.sanitize(password);

    const { name: sanitized_name, email: sanitized_email } =
      registerSchema.parse({ name: sanitizedName, email: sanitizedEmail });

    const foundUser = await User.findOne({ email: sanitized_email });
    if (foundUser) {
      return res.status(409).json({
        error: "User already exists",
        message:
          "A user with this email address already exists. Please try logging in or use a different email.",
      });
    }

    const session = await mongoose.startSession();

    try {
      const userId = new mongoose.Types.ObjectId();
      const dirId = new mongoose.Types.ObjectId();

      session.startTransaction();

      await Directory.insertOne(
        {
          _id: dirId, //added after creating objectID (NEW)
          name: `root-${sanitized_email}`,
          parentDirId: null,
          userId, //added after creating objectID (NEW)
        },
        { session },
      );

      await User.insertOne(
        {
          _id: userId, //added after creating objectID (NEW)
          name: sanitized_name,
          email: sanitized_email,
          password: sanitizedPassword,
          rootDirId: dirId, //added after creating objectID (NEW)
        },
        { session },
      );

      await session.commitTransaction();

      res.status(201).json({ message: "User Registered" });
    } catch (err) {
      // console.log(err)
      // console.log(err.errorResponse.errInfo.details.schemaRulesNotSatisfied[0].propertiesNotSatisfied[0])
      session.abortTransaction();
      if (err.code === 121) {
        res
          .status(400)
          .json({ error: "Invalid input, please enter valid details" });
      } else if (err.code === 11000) {
        if (err.keyValue.email) {
          return res.status(409).json({
            error: "This email already exists",
            message:
              "A user with this email address already exists. Please try logging in or use a different email.",
          });
        }
      } else {
        next(err);
      }
    } finally {
      session.endSession();
    }
  } catch (err) {
    // for ZOD errors, we will send the error message to the front end. We can also use a custom error handler middleware to handle all errors in one place.

    next(err);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const sanitizedEmail = purify.sanitize(email);
    const sanitizedPassword = purify.sanitize(password);
    const { email: sanitized_email } = emailSchema.parse({
      email: sanitizedEmail,
    });
    const user = await User.findOne({ email: sanitized_email });
    // console.log(await user.comparePassword(password))
    if (!user) {
      return res.status(404).json({ error: "Invalid Credentials" });
    }

    if (user.isDeleted) {
      return res.status(403).json({
        error:
          "You cannot login. Please contact your system admin for more info.",
      });
    }

    const isPasswordCorrect = await user.comparePassword(sanitizedPassword);
    // const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(404).json({ error: "Invalid Credentials" });
    }

    const newSession = await Session.create({ userId: user.id });

    const allActiveSessions = await Session.find({ userId: user.id });
    // console.log(allActiveSessions)

    // we can also add a property called as 'maxAllowedDevice' for our user documents and give each user a ste of max devices allowed based on their subscription plan.
    // then in that case the below query would look something like
    // if(allActiveSessions.length >= user.maxAllowedDevices)
    if (allActiveSessions.length >= 3) {
      await allActiveSessions[0].deleteOne(); //grab the first one and delete
    }

    // console.log({allActiveSessions})

    res.cookie("sid", newSession._id.toString(), {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      sameSite: "lax",
      secure: true,
      signed: true,
    });
    res.status(200).json({ message: "logged in" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const getCurrentUser = (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
    picture: req.user.picture,
    role: req.user.role,
  });
};

export const getAllUsers = async (req, res) => {
  const allUsers = await User.find({ isDeleted: false }).lean();
  const allActiveSessions = await Session.find().lean();
  const allActiveSessionsIds = allActiveSessions.map(({ userId }) =>
    userId.toString(),
  );
  const userSet = new Set(allActiveSessionsIds);

  const transformedAllUsersList = allUsers.map(({ name, email, _id }) => ({
    id: _id,
    name,
    email,
    isLoggedIn: userSet.has(_id.toString()),
    // isLoggedIn : allActiveSessionsIds.includes(_id.toString())
  }));
  res.status(200).json(transformedAllUsersList);
};

export const logout = async (req, res) => {
  const sid = req.signedCookies.sid;
  await Session.findByIdAndDelete(sid);
  res.clearCookie("sid");
  res.status(200).end();
};

export const logoutAll = async (req, res) => {
  const sid = req.signedCookies.sid;
  const session = await Session.findById(sid);

  await Session.deleteMany({ userId: session.userId });
  res.clearCookie("sid");
  res.status(204).end();
};

export const logoutUsers = async (req, res) => {
  const { userId } = req.params;
  try {
    await Session.deleteMany({ userId });
  } catch (err) {
    console.log(err.message);
    return res.json({ error: "Something went wrong" });
  }
  return res.status(200).json({ message: `User Logged out successfully` });
};

export const deleteUsers = async (req, res, next) => {
  const { userId } = req.params;
  try {
    // These all methods to delete below are hard delete. We will just use a flag to delete users(soft delete) and display based on that on the UI
    /* await User.findOneAndDelete({ _id: userId });
    await Directory.deleteMany({ userId });
    await File.deleteMany({ userId }); */
    await User.findByIdAndUpdate(userId, { isDeleted: true });
    await Session.deleteMany({ userId });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
  return res.status(200).json({ message: "User Deleted Successfully." });
};
