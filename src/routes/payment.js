const express = require('express');
const { userAuth } = require('../middlewares/auth');
const paymentRouter = express.Router();
const razorpayInstance = require('../utils/razorpay')
const Payment = require('../models/payment');
const { membershipAmount } = require('../utils/constants');
const Payment = require('../models/payment');
const User = require('../models/user');
const {validateWebhookSignature} = rquire('razorpay/dist/utils/razorpay-utils')

paymentRouter.post('/payment/create',userAuth, async(req, res)=>{

    try{
        const {membershipType} = req.body;
        const {firstName, lastName, email} = req.user;
        const order = await razorpayInstance.orders.create({
            amount: membershipAmount[membershipType]*100,
            currency: "INR",
            receipt: "receipt#1",
            notes: {
                firstName,
                lastName,
                email,
                membershipType,
             },
        });
      //console.log(order);
      const payment = new Payment({
        userId : req.user._id,
        orderId: order.id,
        status : order.status,
        amount : order.amount,
        currency: order.currency,
        receipt : order.receipt,
        notes : order.notes,
      });
      const savedPayment = await payment.save();
      res.json({ ...savedPayment.toJSON(), keyId:process.env.RAZORPAY_KEY_ID});
    }catch(err){
        res.status(500).json({message:err.message});
    }
});

paymentRouter.post('/payment/webhook', async(req,res)=>{
  try{
    const webhookSignature = req.headers("X-Razorpay-Signature");

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if(!isWebhookValid){
       return res.status(400).json({msg:"webhook signature is invalid"});
    }

    const paymentDetails = req.body.payload.payment.entity;

    const payment = await Payment.findOne({orderId: paymentDetails.order_id});
    payment.status = paymentDetails.status;
    await payment.save();

    const user = await User.findOne({_id:payment.userId})
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();
    
    

    return res.status(200).json({msg:"Webhook received sucessfully"});
  }catch(err){
       return res.status(500).json({msg: err.message});
  }

});
module.exports = paymentRouter;