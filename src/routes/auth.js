const express = require('express')
const authController = require('../controllers/auth')
const { checkSchema } = require('express-validator')
const {
    registerValidation,
    authValidation,
} = require('../middleware/validationSchema')
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
    checkSchema(authValidation),
    getData,
    checkExist(User, 'email'),
    authController.login
)

router.post(
    '/register',
    checkSchema(registerValidation),
    getData,
    checkExist(User, 'email'),
    authController.register
)

module.exports = router
