const express = require('express');
const profileRouter = express.Router();
const {userAuth} = require('../middlewares/auth');
const {validateEditProfileData} = require('../utils/validation')
const bcrypt = require('bcrypt');
const validator = require('validator');

profileRouter.get('/profile/view', userAuth, async(req,res)=>{
    try{
        const user = req.user;
        res.send(user);
    }catch(err){
        res.status.send("ERROR : "+err.message)
    }
});

profileRouter.patch("/profile/edit", userAuth, async(req,res)=>{
    try{
        if(!validateEditProfileData(req)){
            throw new Error("invalid edit request");
        }
        const loggedInUser = req.user;
        Object.keys(req.body).forEach((key)=>(loggedInUser[key] = req.body[key]));
        await loggedInUser.save();
        res.json({
            message:`${loggedInUser.firstName}, your data updated succesfully`,
            data:loggedInUser,
        });

    }catch(err){
        res.status(400).send("ERROR : "+err.message);
    }
});

profileRouter.patch('/profile/Password', userAuth, async(req,res)=>{
     try{
        const {oldPassword, newPassword} = req.body;
        const loggedInUser = req.user;
        const isoldPasswordvalid = await bcrypt.compare(oldPassword, loggedInUser.password);
        if(!isoldPasswordvalid){
          throw new Error("old password not matched");
        }
        if(!validator.isStrongPassword(newPassword)){
            throw new Error("your new password should be strong");
        }
        const passwordHash = await bcrypt.hash(newPassword, 10);
        loggedInUser.password = passwordHash;
        await loggedInUser.save();
        res.send("password changed..");

     }catch(err){
        res.status(400).send("ERROR :"+ err.message);
     }
});
module.exports = profileRouter;