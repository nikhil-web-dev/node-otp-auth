const express = require('express')
const router = express.Router()
const {check, validationResult} = require('express-validator')

require('../Controllers/AuthController')

router.post('/auth/register',  inputValidate, register)
router.post('/auth/login', login)
router.post('/auth/verify', verifyLogin)
router.post('/auth/resend_otp', resendOTP)

module.exports = router;
