const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minLength:4,
        maxLength:50,
    },
    lastName:{
        type:String,
        minLength:4,
        maxLength:50,
        
    },
    email:{
        type:String,
        required: true,
        unique:true,
        lowercase: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email address : " + value);
            }
        }

    },
    password:{
        type:String,
        required:true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("enter strong password :"+value)
            }
        }
        
    },
    age:{
        type: Number,
        min: 18,
        max: 70,
        
       
    },
    gender: {
        type: String,
        enum: {
          values: ["male", "female", "other"],
          message: `{VALUE} is not a valid gender type`,
        },

    },
    photoUrl :{
        type: String,
        default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThW-ztkyKIYQwy7DpWxWYYu-r8YwIm4UbxpQ&s",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("invalid photo url: " +value)
            }
        }
    },
    about:{
        type:String,
        default: "This is a default about of the user"
    },
    skills:{
        type:[String],
    },
    
   
},{
    timestamps : true,
});

userSchema.methods.getJWT = async function(){
    const user = this;
    const token = await jwt.sign({_id:user._id}, "DEVTINDER@630501",{
    expiresIn:"7d"
    });
    return token;
};

userSchema.methods.validatePassword = async function(passwordInputByUser){
    const user = this;
    const passwordHash = user.password;
    const isPasswordValid = await bcrypt.compare(
        passwordInputByUser,
        passwordHash
    );
    return isPasswordValid;
};


module.exports = mongoose.model("User", userSchema)