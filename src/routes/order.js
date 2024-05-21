const express = require('express')
const orderController = require('../controllers/order')
const { verifyToken, checkAdmin } = require('../middleware/middlewares')
const Order = require('../models/order')

const router = express.Router()

router.put(
    '/status/:_id',
    verifyToken,
    checkAdmin,
    orderController.updateStatus
)

router.post('/', verifyToken, orderController.createOrder)

router.get('/:_id', verifyToken, orderController.getOrder)
router.get('/', verifyToken, checkAdmin, orderController.getAllUserOrders)

module.exports = router
