import User from "../models/userModel.js";
import Subscription from "../models/subscriptionModel.js";
import razorpayInstance from "../services/razorpay.js";


export const createSubscription = async (req, res, next) => {
  const user = req.user;
  const foundUser = await User.findById(user._id);
  const { planId } = req.body;
  const subscription = await razorpayInstance.subscriptions.create({
    plan_id: planId,
    total_count: 12,
    notes: {
      userId: foundUser._id,
      userName: foundUser.name,
      userEmail: foundUser.email,
    },
  });

  if (subscription.status === "created") {
    try{
      const newSubscription = new Subscription({
      userId: user._id,
      planId: planId,
      razorpaySubscriptionId: subscription.id,
      billingCycle: subscription.plan.period,
      status: 'pending'
    });

    await newSubscription.save()
    }catch(err){
      next(err)
    }
  }
  res.status(200).json({ subscriptionId: subscription.id });
};
