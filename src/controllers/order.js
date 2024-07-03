const mongoose = require('mongoose')
const Order = require('../models/order')
const User = require('../models/user')
const Coupon = require('../models/coupon')
const { responseData } = require('../utils/helpers')

const getAllUserOrders = async (req, res) => {
    try {
        const { page, pageSize } = req.query
        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
        const limit = parseInt(pageSize, 10)

        const pipeline = [
            [
                {
                    $unwind: '$products',
                },
                {
                    $lookup: {
                        from: 'productDetails',
                        localField: 'products.productDetail',
                        foreignField: '_id',
                        as: 'productDetailLookup',
                    },
                },
                {
                    $addFields: {
                        'products.productDetail': {
                            $arrayElemAt: ['$productDetailLookup', 0],
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productDetailLookup.product',
                        foreignField: '_id',
                        as: 'productLookup',
                    },
                },
                {
                    $addFields: {
                        'productDetailLookup.product': {
                            $arrayElemAt: ['$productLookup', 0],
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'variationOptions',
                        localField: 'products.variationOption',
                        foreignField: '_id',
                        as: 'variationOptionLookup',
                    },
                },
                {
                    $addFields: {
                        'products.variationOption': {
                            $arrayElemAt: ['$variationOptionLookup', 0],
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'variations',
                        localField: 'variationOptionLookup.variation',
                        foreignField: '_id',
                        as: 'variationLookup',
                    },
                },
                {
                    $addFields: {
                        'variationOptionLookup.variation': {
                            $arrayElemAt: ['$variationLookup', 0],
                        },
                    },
                },
                {
                    $group: {
                        _id: '$_id',
                        orderBy: { $first: '$orderBy' },
                        status: { $first: '$status' },
                        products: {
                            $push: {
                                productDetail: '$productLookup',
                                quantity: '$products.quantity',
                                variationOption: '$variationLookup',
                            },
                        },
                    },
                },
                { $skip: skip ? skip : 0 },
                { $limit: limit ? +limit : 5 },
                {
                    $project: {
                        productDetailLookup: 0,
                        productLookup: 0,
                        variationOptionLookup: 0,
                        variationLookup: 0,
                    },
                },
            ],
        ]
        const orders = await Order.aggregate(pipeline)
        const totalOrders = await Order.countDocuments()
        console.log('1')
        if (!response) return responseData(res, 404, 1, 'No order found')
        responseData(res, 200, 0, '', '', orders, page, pageSize, totalOrders)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getOrder = async (req, res) => {
    try {
        const { _id } = req.user
        const { page, pageSize } = req.query
        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
        const limit = parseInt(pageSize, 10)

        const pipeline = [
            {
                $match: {
                    orderBy: new mongoose.Types.ObjectId(_id),
                },
            },
            {
                $lookup: {
                    from: 'productdetails',
                    localField: 'products.productDetail',
                    foreignField: '_id',
                    as: 'productDetailLookup',
                },
            },
            {
                $addFields: {
                    'products.productDetail': {
                        $arrayElemAt: ['$productDetailLookup', 0],
                    },
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productDetail.product',
                    foreignField: '_id',
                    as: 'productLookup',
                },
            },
            {
                $addFields: {
                    'products.productDetail.product': {
                        $arrayElemAt: ['$productLookup', 0],
                    },
                },
            },
            {
                $lookup: {
                    from: 'variationoptions',
                    localField: 'products.variationOption',
                    foreignField: '_id',
                    as: 'variationOptionLookup',
                },
            },
            {
                $addFields: {
                    'products.variationOption': {
                        $arrayElemAt: ['$variationOptionLookup', 0],
                    },
                },
            },
            {
                $lookup: {
                    from: 'variations',
                    localField: 'products.variationOption.variationId',
                    foreignField: '_id',
                    as: 'variationLookup',
                },
            },
            {
                $addFields: {
                    'products.variationOption.variationId': {
                        $arrayElemAt: ['$variationLookup', 0],
                    },
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            { $skip: skip ? skip : 0 },
            { $limit: limit ? +limit : 5 },
            {
                $project: {
                    productDetailLookup: 0,
                    productLookup: 0,
                    variationOptionLookup: 0,
                    variationLookup: 0,
                },
            },
        ]

        const orders = await Order.aggregate(pipeline)
        console.log(
            'orders',
            orders.map((order) => order._id)
        )

        const totalOrders = await Order.countDocuments()
        if (!orders || orders.length === 0)
            return responseData(res, 400, 1, 'No order found')
        responseData(
            res,
            200,
            0,
            '',
            '',
            orders,
            page ? page : 1,
            pageSize ? pageSize : 5,
            totalOrders
        )
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getOrderByStatus = async (req, res) => {
    try {
        const { status } = req.params
        const { _id } = req.user
        const { page, pageSize } = req.query
        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 5)
        const limit = parseInt(pageSize, 5)

        const pipeline = [
            {
                $match: {
                    orderBy: new mongoose.Types.ObjectId(_id),
                    status,
                },
            },
            {
                $lookup: {
                    from: 'productdetails',
                    localField: 'products.productDetail',
                    foreignField: '_id',
                    as: 'productDetailLookup',
                },
            },
            {
                $addFields: {
                    'products.productDetail': {
                        $arrayElemAt: ['$productDetailLookup', 0],
                    },
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productDetail.product',
                    foreignField: '_id',
                    as: 'productLookup',
                },
            },
            {
                $addFields: {
                    'products.productDetail.product': {
                        $arrayElemAt: ['$productLookup', 0],
                    },
                },
            },
            {
                $lookup: {
                    from: 'variationoptions',
                    localField: 'products.variationOption',
                    foreignField: '_id',
                    as: 'variationOptionLookup',
                },
            },
            {
                $addFields: {
                    'products.variationOption': {
                        $arrayElemAt: ['$variationOptionLookup', 0],
                    },
                },
            },
            {
                $lookup: {
                    from: 'variations',
                    localField: 'products.variationOption.variationId',
                    foreignField: '_id',
                    as: 'variationLookup',
                },
            },
            {
                $addFields: {
                    'products.variationOption.variationId': {
                        $arrayElemAt: ['$variationLookup', 0],
                    },
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            { $skip: skip ? skip : 0 },
            { $limit: limit ? +limit : 5 },
            {
                $project: {
                    productDetailLookup: 0,
                    productLookup: 0,
                    variationOptionLookup: 0,
                    variationLookup: 0,
                },
            },
        ]

        const orders = await Order.aggregate(pipeline)
        const totalOrders = await Order.countDocuments()
        if (!orders || orders.length === 0)
            return responseData(res, 400, 1, 'No order found')
        responseData(
            res,
            200,
            0,
            '',
            '',
            orders,
            page ? page : 1,
            pageSize ? pageSize : 5,
            totalOrders
        )
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createOrder = async (req, res) => {
    try {
        const { _id } = req.user

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

        // Create order
        const orderData = {
            products,
            total,
            orderBy: _id,
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
    getOrderByStatus,
}
