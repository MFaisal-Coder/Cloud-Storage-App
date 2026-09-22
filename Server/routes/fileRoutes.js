import express from "express";
import validateID from "../middlewares/validateID.js";
import { deleteFile, readFile, updateFile, uploadComplete, uploadFile, uploadInitiate } from "../controllers/fileControllers.js";

const router = express.Router();

// Validaton Middlewares
router.param("id", validateID);
router.param("parentDirId", validateID);

// File middleware routes with file controllers
router.post("/uploads/initiate", uploadInitiate)
router.post("/uploads/complete", uploadComplete)
router.post("/:parentDirId?", uploadFile);
router.get("/:id", readFile);
router.patch("/:id", updateFile);
router.delete("/:id", deleteFile);

export default router;
