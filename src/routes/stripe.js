const express = require('express')
const stripeController = require('../controllers/stripe')
const { verifyToken } = require('../middleware/middlewares')

const router = express.Router()

router.post(
    '/create-checkout-session',
    verifyToken,
    stripeController.createCheckoutSession
)

module.exports = router
