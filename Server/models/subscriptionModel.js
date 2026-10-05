import { model, Schema } from "mongoose";

const subscriptionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    planId:{
        type: String,
        required: true
    },
    razorpaySubscriptionId:{
        type: String,
        required: true
    },
    billingCycle:{
        type: String,
        default: 'monthly',
        enum : ['monthly','yearly']
    },
    status:{
        type: String,
        default: 'pending',
        enum : ['pending' , 'active' , 'past_due' , 'paused' , 'canceled' , 'in_grace']
    },
    currentPeriodStart:{
        type: Date,
    },
    currentPeriodEnd:{
        type: Date,
    }

},{
    timestamps: true
})

const Subscription = model('Subscription', subscriptionSchema)
export default Subscription