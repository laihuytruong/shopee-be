const mongoose = require('mongoose')
const Order = require('../models/order')
const User = require('../models/user')
const Coupon = require('../models/coupon')
const { responseData } = require('../utils/helpers')

const getAllUserOrders = async (req, res) => {
    try {
        const { _id } = req.user
        const queries = { ...req.query }
        const excludeFields = ['limit', 'page']
        excludeFields.forEach((el) => delete queries[el])

        let queryString = JSON.stringify(queries)
        const formattedQueries = JSON.parse(queryString)
        let queryCommand = Order.find(formattedQueries)

        const page = +req.query.page || 1
        const limit = +req.query.limit || 6
        const skip = (page - 1) * limit
        queryCommand.skip(skip).limit(limit)

        const response = await queryCommand
        const count = await Order.find(formattedQueries).countDocuments()
        if (!response) return responseData(res, 404, 1, 'No order found')
        responseData(res, 200, 0, '', count, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getOrder = async (req, res) => {
    try {
        const { _id } = req.user
        const response = await Order.find({ orderBy: _id }).populate('coupon')
        if (!response) return responseData(res, 400, 1, 'No order found')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createOrder = async (req, res) => {
    try {
        const { _id } = req.user
        const { coupon } = req.body

        if (!_id || !mongoose.Types.ObjectId.isValid(coupon))
            return responseData(res, 400, 1, 'Invalid coupon id')

        const userCart = await User.findById(_id)
            .select('cart')
            .populate('cart.product', 'productName price')

        if (!userCart.cart || userCart.cart.length === 0) {
            return responseData(res, 404, 1, 'No cart found')
        }
        const products = userCart.cart.map((el) => ({
            product: el.product._id,
            quantity: el.quantity,
            color: el.color,
        }))

        let total = userCart.cart.reduce(
            (sum, el) => el.product.price * el.quantity + sum,
            0
        )
        if (coupon) {
            const couponData = await Coupon.findById(coupon)

            if (!couponData) {
                return responseData(res, 404, 1, 'No coupon found')
            }

            if (Date.now() > couponData.expireDate) {
                return responseData(res, 400, 1, 'Coupon expired')
            }

            // Apply discount and round to nearest thousand
            total =
                Math.round((total * (1 - couponData.discount / 100)) / 1000) *
                1000
        }

        // Create order
        const orderData = {
            products,
            total,
            orderBy: _id,
        }

        if (coupon) {
            orderData.coupon = coupon
        }

        const response = await Order.create(orderData)

        return responseData(
            res,
            201,
            1,
            'Order created successfully',
            null,
            response
        )
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const updateStatus = async (req, res) => {
    try {
        const { _id } = req.params
        const { status } = req.body
        if (!_id || !mongoose.Types.ObjectId.isValid(_id))
            return responseData(res, 400, 1, 'Invalid ID')
        if (!status) return responseData(res, 400, 1, 'Status cannot be empty')
        const response = await Order.findByIdAndUpdate(
            _id,
            { status },
            { new: true }
        )
        if (!response) return responseData(res, 400, 1, 'Update status failed')
        responseData(res, 200, 0, 'Update status successfully', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    getAllUserOrders,
    getOrder,
    createOrder,
    updateStatus,
}
