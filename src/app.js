const express = require('express');
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser')
const app = express();
const cors = require('cors');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');
const paymentRouter = require('./routes/payment');
require('dotenv').config();
require('./utils/cronJob');

app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}));
//This middleware converting json object into js object 
app.use(express.json());
//This middleware is used to read the cookies
app.use(cookieParser());


app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);
app.use('/', paymentRouter);


connectDB()
      .then(()=>{
        console.log('database connected succesfully');
        app.listen(process.env.PORT, ()=>{
        console.log("server listening on port number: ",process.env.PORT);
        });
        })
      .catch(()=>{
        console.log('database not connected succesfully');
      })

