const express = require('express')
const orderController = require('../controllers/order')
const { verifyToken, checkAdmin } = require('../middleware/middlewares')
const Order = require('../models/order')

const router = express.Router()

router.put('/status/:_id', verifyToken, orderController.updateStatus)

router.post('/', verifyToken, orderController.createOrder)

router.get('/all', verifyToken, checkAdmin, orderController.getAllUserOrders)
router.get('/:status', verifyToken, orderController.getOrderByStatus)
router.get('/', verifyToken, orderController.getOrder)

module.exports = router
