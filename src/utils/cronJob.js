const cron = require('node-cron');
const {subDays, startOfDay, endOfDay} = require('date-fns');
const ConnectionRequestModel = require('../models/connectionRequest');
const sendEmail = require('./sendEmail')
// this cronjob will run at 10am in the morning
cron.schedule("0 10 * * *",async ()=>{
    //sending mails to who got the requests the previous day
    try{
     
     const yesterday = subDays(new Date(), 1);
     const yesterdayStart = startOfDay(yesterday);
     const yesterdayEnd = endOfDay(yesterday);
     const pendingRequestsOfYesterday = await ConnectionRequestModel.find({
        status: "interested",
        createdAt :{
        $gte : yesterdayStart,
        $lt : yesterdayEnd,
        },
     }).populate("fromUserId toUserId");
     
     const listOfEmails =[
        ...new Set(pendingRequestsOfYesterday.map(req=> req.toUserId.email))
    ]
     //console.log(listOfEmails);
     for(const email of listOfEmails){

        try{
            const res = await sendEmail.run(
                "New Request Pending For "+ email,
                "There are so many friend requests pending, please login to techmate.today and accept or reject the request"
            );
            console.log(res);

        }catch(err){
             console.log(err);
        }
     }

    }catch(err){
        console.log(err);
    }
});