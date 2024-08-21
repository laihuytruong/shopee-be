const express = require('express')
const orderController = require('../controllers/order')
const { verifyToken, checkAdmin } = require('../middleware/middlewares')
const Order = require('../models/order')

const router = express.Router()

router.put('/status/:_id', verifyToken, orderController.updateStatus)

router.post('/', verifyToken, orderController.createOrder)

router.get('/search', verifyToken, orderController.search)
router.get('/all', verifyToken, checkAdmin, orderController.getAllUserOrders)
router.get('/all/:type', verifyToken, checkAdmin, orderController.getDataChart)
router.get('/:status', verifyToken, orderController.getOrderByStatus)
router.get(
    '/all/:status',
    verifyToken,
    checkAdmin,
    orderController.getAllOrderByStatus
)
router.get('/', verifyToken, orderController.getOrder)
router.post('/filter', verifyToken, checkAdmin, orderController.filter)

module.exports = router
