import express from "express";
import { razorpayWebhook } from "../controllers/razorpayWebhook.js";

const router = express.Router();

router.post("/razorpay", razorpayWebhook)

export default router;
