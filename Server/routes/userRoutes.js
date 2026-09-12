import express from "express";
import checkAuth from "../middlewares/auth.js";
import {checkIsAdminUser, checkUserRole} from "../middlewares/userRoleAuth.js";
import {
  createUser,
  deleteUsers,
  getAllUsers,
  getCurrentUser,
  loginUser,
  logout,
  logoutAll,
  logoutUsers,
} from "../controllers/userControllers.js";
import Session from "../models/sessionModel.js";
import {registerlimiter, loginLimiter} from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/user/register",registerlimiter, createUser);
router.post("/user/login", loginLimiter,loginUser);
// User controllers & middlewares
router.get("/user", checkAuth, getCurrentUser);
router.post("/user/logout", logout);
router.post("/user/logout-all", logoutAll);

// Multiple users controllers & middlewares
router.get("/users", checkAuth, checkUserRole, getAllUsers);

router.post('/users/:userId/logout', checkAuth, checkUserRole, logoutUsers)
router.delete('/users/:userId', checkAuth, checkIsAdminUser, deleteUsers)

export default router;
