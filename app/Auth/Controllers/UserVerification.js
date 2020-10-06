var express = require('express')
const config = require('config')
const User = require('../../models/User')
const UserOTP = require('../../models/UserOTP')
const { verify } = require('jsonwebtoken')

 generateOTP = async(phone) =>{

    //create random 4 digit otp
    const otp = Math.floor(Math.random() * (999)) + 1000
   
    
    //find User
    let user = await User.findOne({phone})
    if(!user) return {
        status: false,
        message: {
            error: 'user does not exist, need to register'
        }
    }

    console.log(user);
    
   

    //create message
    let message =   `Hi  ${user.name} , OTP to verify your account is  ${otp}.
                    OTP will expire in 5 minutes. Do not share with anyone.`

    console.log(message);
                    
    //send message
    const smsStatus = true

    //message status, if true
    if(smsStatus){

         //save in database 
         let userOTP = new UserOTP({otp, user: user.id})
         await userOTP.save()
 
         return {
            status: true,
            message: 'generated successfully'

         }
    }
    
}

verifyOTP = async(phone, received_otp) => {

  
        //find if user exist
        const user = await User.findOne({phone})

        if(!user) return {
            status: false,
            message: {
                error: 'user not found, need to register'
            }
        }
        
    
        //get otp details
        let userOTP = await UserOTP.findOne({user: user.id, otp: received_otp, status: true })
        
        if(!userOTP) return {
            status:false,
            message:{
                error: 'OTP not found'
            }
        }

        //check if otp is expired
        let now =  Date.now() 
        let otpDate = new Date(userOTP.created_at)
        let diff = Math.abs(now - otpDate);
        var minutes = Math.floor((diff/1000)/60);
        console.log(minutes);

        if(minutes > 5){
            let update = await UserOTP.findOneAndUpdate({user: user.id, otp: received_otp},{status: false})
            console.log('otp expired');

            return {
                status:false,
                message:{
                    error:'OTP expired'
                }
            }
            
        }

        let updateOTP = await UserOTP.findOneAndUpdate({user: user.id, otp: received_otp},{status: false, deleted_at: now})

    
    return {
        status:true,
        message:'user authenticated',
        user_id: user.id
    }
    

    
   
}

module.exports = {
    generateOTP,
    verifyOTP
}