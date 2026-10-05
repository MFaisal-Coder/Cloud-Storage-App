import { axiosWithCreds } from "./axiosInstances";

export const createSubscription = async(planId) =>{
    const {data} = await axiosWithCreds.post('/razorpay/create-subscription', {planId})
    return data
}