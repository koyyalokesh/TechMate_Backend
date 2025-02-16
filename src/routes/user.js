const express = require('express');
const userRouter = express.Router();
const {userAuth} = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest')
const User = require('../models/user');
const USER_SECRET_DATA = "firstName lastName photoUrl gender age about skills"
//get api , to gell all the requests received for the login user
userRouter.get('/user/requests/received', userAuth, async(req,res)=>{
      try{
        const loggedInUser = req.user;
        const connectionRequest = await ConnectionRequest.find({
            toUserId :loggedInUser._id,
            status : "interested",
        }).populate("fromUserId", USER_SECRET_DATA);
        if(!connectionRequest){
           return res.status(404).json({message:"connection requests not found"});
        }
        res.json({
            message : "data fetched successfully",
            data: connectionRequest,
        });

      }catch(err){
         res.status(400).json("ERROR :"+err.message);
      }
});

//get api, to get all the user connections
userRouter.get('/user/connections', userAuth, async(req,res)=>{
       try{
          const loggedInUser = req.user;
          const connectionRequests = await ConnectionRequest.find({
                $or:[
                    {toUserId:loggedInUser._id, status:"accepted"},
                    {fromUserId:loggedInUser._id, status:"accepted"}
                ],
          }).populate("fromUserId", USER_SECRET_DATA).populate("toUserId",  USER_SECRET_DATA);
        
        const data = connectionRequests.map( (row) =>{
            if(row.fromUserId._id.equals(loggedInUser._id)){
                return row.toUserId;
            }
            return row.fromUserId;
        });
       
        res.json({data:data});


       }catch(err){
             res.status(400).json("ERROR :"+err.message);
       }
});

//feed api
userRouter.get('/feed', userAuth, async(req,res)=>{
    try{
        const loggedInUser = req.user;
        const page = req.query.page || 1;
        let limit = req.query.limit || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page -1)*limit;
        const connectionRequests = await ConnectionRequest.find({
        $or:[
            {fromUserId:loggedInUser._id},
            {toUserId:loggedInUser._id}
        ]
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach((req)=>{
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        });

        const users = await User.find({
            $and:[
                { _id : { $nin : Array.from(hideUsersFromFeed)}},
                { _id : { $ne : loggedInUser._id }}
            ],
        }).select(USER_SECRET_DATA).skip(skip).limit(limit);
        res.send({data:users});

    }catch(err){
         res.status(400).json("ERROR :"+err.message);
    }
});


module.exports = userRouter;