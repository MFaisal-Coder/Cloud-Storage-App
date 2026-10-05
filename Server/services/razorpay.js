import Razorpay from "razorpay";

const razorpayInstance = new Razorpay({
  key_id: process.env.RZPAY_TEST_API_KEY,
  key_secret: process.env.RZPAY_TEST_KEY_SECRET,
});

export default razorpayInstance;
