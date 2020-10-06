const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const {check, validationResult} = require('express-validator')
const {generateOTP, verifyOTP} = require('../Controllers/UserVerification')
const Users = require('../../models/User')

inputValidate = [
        check('name','Name is Required').not().isEmpty(),
        check('email','Provide valid email').isEmail(),
        check('phone').isLength({ min: 10, max: 10 }).isInt(), 
]



register = async(req, res) => {
    
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(400).json({erros: errors.array()})
    }
    
    try {
        const {name, email, phone} = req.body

        //find user
        let user = await Users.findOne({email})

        //if user already exist
        if(user) return res.status(400).json({error: [{message: 'user already exsit'}]})

        //creating instanse
        user = new Users({
            name,
            email,
            phone
        })
        //save user
        await user.save()

        let generateOTPStatus = await generateOTP(user.phone)
         
        console.log(generateOTPStatus.status);
        
        return res.status(200).json({message:'user registered, please verify your phone'})
      
    } catch (err) {
        console.log(err);
        
        return res.status(500).send('server error')
    }
  
  
}





login = async(req, res) => {
   
    const errors = validationResult(req)

    if(!errors.isEmpty){
        return res.status(400).json({errors: errors.array()})
    }

    try {
        const { phone } = req.body

        let generateOTPStatus = await generateOTP(phone)

        if(generateOTPStatus.status){
            return res.status(200).json(generateOTPStatus.message)
        }else{
            return res.status(400).json(generateOTPStatus.message.error)
        }

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({message:'server error'})
    }
}

verifyLogin = async(req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty){
        return res.status(400).json({errors: errors.array()})
    }

    try {
        const {phone, otp} = req.body
        let verifyStatus = await verifyOTP(phone, otp)

        
        if(verifyStatus.status){
            //create payload
            const payload = {
                user:{
                    id: verifyStatus.user_id,
                }
            }

            //sign json
            jwt.sign(
                payload, 
                config.get('jwtSecret'), 
                {expiresIn: 36000},
                (err, token) => {
                if(err) throw err;
                console.log(token);
                
                return res.status(200).json({token})
                }
            )

        }else{
            return res.status(400).json(verifyStatus.message.error)
        }
     
        
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({message:'server error'})
    }
}

module.exports = {
    register,
    login,
    inputValidate
}