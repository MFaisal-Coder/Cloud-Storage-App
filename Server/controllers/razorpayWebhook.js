import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import Subscription from "../models/subscriptionModel.js";
import User from "../models/userModel.js";

export const PLANS = {
  plan_TkBpn8ccJu4qfm: {
    code: "2TB-Monthly",
    storageQuotaBytes: 2 * 1024 ** 4,
  },
  plan_TkBqdtqvK8dk9A: {
    code: "5TB-Monthly",
    storageQuotaBytes: 5 * 1024 ** 4,
  },
  plan_TkBrbv3oKeZknK: {
    code: "10TB-Monthly",
    storageQuotaBytes: 10 * 1024 ** 4,
  },
  plan_TkBs8Urkwdme4Q: {
    code: "2TB-Yearly",
    storageQuotaBytes: 2 * 1024 ** 4,
  },
  plan_TkBsa9csZcNM3i: {
    code: "5TB-Yearly",
    storageQuotaBytes: 5 * 1024 ** 4,
  },
  plan_TkBt25JS1qOxtq: {
    code: "10TB-Yearly",
    storageQuotaBytes: 10 * 1024 ** 4,
  },
};

export const razorpayWebhook = async (req, res) => {
  const razorpaySignature = req.headers["x-razorpay-signature"];
  const razorpaySecret = process.env.RZPAY_WEBHOOK_SECRET;
  const isValidSignature = validateWebhookSignature(
    JSON.stringify(req.body),
    razorpaySignature,
    razorpaySecret,
  );

  if (!isValidSignature) {
    return res.status(400).send("Invalid webhook signature");
  }

  try {
    if (req.body.event === "subscription.activated") {
      const rzpsubscription = req.body.payload.subscription.entity;
      const subscriptionId = rzpsubscription.id
      const subscriptionDetails = await Subscription.findOne({
        razorpaySubscriptionId: subscriptionId,
      });
      subscriptionDetails.status = rzpsubscription.status;

      const existingUser = await User.findOne({
        _id: subscriptionDetails.userId,
      });
      await subscriptionDetails.save();
      const planId = subscriptionDetails.planId;
      existingUser.maxStorageSize = PLANS[planId].storageQuotaBytes;
      existingUser.subscriptionId = subscriptionDetails.razorpaySubscriptionId;
      await existingUser.save();
      console.log("subscription activated");
    }
  } catch (err) {
    console.log(
      err.errorResponse.errInfo.details.schemaRulesNotSatisfied[0]
        .propertiesNotSatisfied[0].details,
    );
  }

  res.status(200).end();
};
