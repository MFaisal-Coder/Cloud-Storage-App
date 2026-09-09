import express from 'express'
import { loginWithGoogleController, sendOtpController, verifyOtpController } from '../controllers/authControllers.js'

const router = express.Router()

router.post('/send-otp', sendOtpController)
router.post('/verify-otp', verifyOtpController)
router.post('/google', loginWithGoogleController)

export default router