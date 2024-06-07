const express = require('express')
const authController = require('../controllers/auth')
const { checkSchema } = require('express-validator')
const {
    registerValidation,
    loginValidation,
    emailValidation,
} = require('../middleware/validation/authValidation')
const { getData, checkExist } = require('../middleware/middlewares')
const User = require('../models/user')

const router = express.Router()

router.put('/reset-password/:token', authController.resetPassword)

router.get('/forgot-password', authController.fortgotPassword)

router.post('/refresh-token', authController.generateNewToken)

router.post('/logout', authController.logout)

router.post(
    '/login',
    checkSchema(loginValidation),
    getData,
    checkExist(User, 'email', false),
    authController.login
)

router.post(
    '/register',
    checkSchema(registerValidation),
    getData,
    authController.register
)

router.post(
    '/register/verify',
    checkSchema(emailValidation),
    getData,
    checkExist(User, 'email', false),
    authController.verifyEmail
)

module.exports = router
