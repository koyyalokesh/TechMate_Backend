const validator = require('validator');

const validateSignupData = (req)=>{
    const {firstName, lastName, email, password} = req.body;
    if(!firstName || !lastName){
        throw new Error("Name is not valid")
    }else if(!validator.isEmail(email)){
        throw new Error("email is not valid")
    }else if(!validator.isStrongPassword(password)){
        throw new Error("please enter a strong password")
    }
};

const validateEditProfileData = (req) => {
   const allowedEditData =[
    "firstName",
    "lastName",
    "email",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills"
   ]
   const isEditAllowed = Object.keys(req.body).every((field) => allowedEditData.includes(field));
   return isEditAllowed;
  };
  
module.exports ={
     validateSignupData,
     validateEditProfileData,
}