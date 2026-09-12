import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { connectDB } from "./config/db.js";
import checkAuth from "./middlewares/auth.js";
import authRoutes from "./routes/authRoutes.js";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import helmet from "helmet";

await connectDB();

const app = express();
const MY_SECRET_KEY = process.env.MY_SECRET_KEY;
const PORT = process.env.PORT;

try {
  app.use(cookieParser(MY_SECRET_KEY));
  app.use(express.json());
  app.use(
    cors({
      origin: process.env.ORIGIN,
      credentials: true,
    }),
  );
  app.use(helmet())

  app.use("/auth", authRoutes);
  app.use("/", userRoutes);
  app.use("/directory", checkAuth, directoryRoutes);
  app.use("/file", checkAuth, fileRoutes);

  app.use((err, req, res, next) => {
    console.log(err);
    // res.status(err.status || 500).json({ error: "Something went wrong!!" });
    // for testing purpose we will snd the entire error on front end... below
    res.json(err);
  });

  app.listen(PORT, () => {
    console.log(`Server Started on port ${PORT}`);
  });
} catch (err) {
  console.log("Error connecting to Database!");
  console.log(err);
}
