const express = require('express')
const authController = require('../controllers/auth')
const { checkSchema } = require('express-validator')
const {
    registerValidation,
    loginValidation,
} = require('../middleware/validation/authValidation')
const {
    getData,
    checkExist,
    verifyToken,
} = require('../middleware/middlewares')
const User = require('../models/user')

const router = express.Router()

router.put('/reset-password', authController.resetPassword)

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
    checkExist(User, 'email', false),
    authController.register
)

module.exports = router
