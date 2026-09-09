import express from "express";
import validateID from "../middlewares/validateID.js";
import deleteDirectory, { createDirectory, getDirectoryByID, renameDirectory } from "../controllers/directoryControllers.js";

const router = express.Router();

// Validation middlewares
router.param("id", validateID);
router.param("parentDirId", validateID);

// Directory routes middleware with directory controllers
router.get("/:id?", getDirectoryByID);
router.post("/:parentDirId?", createDirectory);
router.patch("/:id", renameDirectory);
router.delete("/:id", deleteDirectory);

export default router;
