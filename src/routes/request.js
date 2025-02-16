const express = require('express');
const requestRouter = express.Router();
const {userAuth} = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const { findById } = require('../models/user');
const User = require('../models/user')
const sendEmail = require("../utils/sendEmail");

requestRouter.post('/request/send/:status/:toUserId', userAuth, async(req,res) =>{
    try{
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        
        const allowedStatus = ["ignored", "interested"];
        if(!allowedStatus.includes(status)){
            return res
                  .status(400)
                  .json({message :'invalid status type :'+ status});
        }
        if(fromUserId.equals(toUserId)){
            return res.status(400).json({
                message:"Cannot send connection request to yourself!"
            });
        }

        const toUser = await User.findById(toUserId);

        if(!toUser){
           return res.status(400).json({message : "user not found"});
        }
       
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or:[
                {fromUserId, toUserId},
                {fromUserId:toUserId, toUserId:fromUserId},
            ],
        });
        if(existingConnectionRequest){
            return res.status(400).json({
                message:"connection request already exists.."
            });
        }
       
        const connectionRequest = new ConnectionRequest({
                fromUserId,
                toUserId,
                status,
            });
        const data = await connectionRequest.save();       
        const emailRes = await sendEmail.run(
            "A new Friend Request from "+req.user.firstName,
        req.user.firstName+ " is " +status+ " in " +toUser.firstName
        );
        res.json({
            message:req.user.firstName+ " is " +status+ " in " +toUser.firstName,
            data,
        })
        }catch(err){
            res.status(400).send("ERROR : "+err.message);
        }
 

});

requestRouter.post('/request/review/:status/:requestId', userAuth, async(req,res)=>{
    try{
        const loggedInUser = req.user;
        const {status, requestId} = req.params;
        const allowedStatus = ["accepted", "rejected"];
        if(!allowedStatus.includes(status)){
            return res.status(400).json({message:"status not allowed.."})
        }
        const connectionRequest = await ConnectionRequest.findOne({
            _id:requestId,
            toUserId: loggedInUser._id,
            status:"interested",
        });
        if(!connectionRequest){
            return res.status(404).json({message:"connection request not found.."})
        }
        connectionRequest.status = status;
        const data = await connectionRequest.save();
        res.json({message:"connection request "+status,data});

    }catch(err){
        res.status(400).json("ERROR :"+err.message);
    }
});
module.exports = requestRouter;