const express = require('express')
const stripeController = require('../controllers/stripe')
const { verifyToken, checkAdmin } = require('../middleware/middlewares')

const router = express.Router()

router.post(
    '/create-checkout-session',
    verifyToken,
    stripeController.createCheckoutSession
)

router.get(
    '/amount',
    verifyToken,
    checkAdmin,
    stripeController.getTotalTransactionsAndAmount
)

module.exports = router
