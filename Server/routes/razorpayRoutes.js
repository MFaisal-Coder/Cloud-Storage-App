import express from "express";
import { createSubscription } from "../controllers/razorpayController.js";

const router = express.Router();

router.post("/create-subscription", createSubscription);

export default router;