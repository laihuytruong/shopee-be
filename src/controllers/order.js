const mongoose = require('mongoose')
const Order = require('../models/order')
const User = require('../models/user')
const Coupon = require('../models/coupon')
const {
    responseData,
    performSearch,
    getPipelineByType,
} = require('../utils/helpers')
const removeAccents = require('remove-accents')

const getAllUserOrders = async (req, res) => {
    try {
        const { page, pageSize } = req.query
        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
        const limit = parseInt(pageSize, 10)

        const pipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'orderBy',
                    foreignField: '_id',
                    as: 'userLookup',
                },
            },
            {
                $addFields: {
                    orderBy: {
                        $arrayElemAt: ['$userLookup', 0],
                    },
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
                    userLookup: 0,
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

const getAllOrderByStatus = async (req, res) => {
    try {
        const { status } = req.params
        const { page, pageSize } = req.query
        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 5)
        const limit = parseInt(pageSize, 5)

        const pipeline = [
            {
                $match: {
                    status,
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'orderBy',
                    foreignField: '_id',
                    as: 'userLookup',
                },
            },
            {
                $addFields: {
                    orderBy: {
                        $arrayElemAt: ['$userLookup', 0],
                    },
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
                    userLookup: 0,
                },
            },
        ]

        const orders = await Order.aggregate(pipeline)
        const totalOrders = await Order.countDocuments({
            status,
        })
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
                    from: 'users',
                    localField: 'orderBy',
                    foreignField: '_id',
                    as: 'orderBy',
                },
            },
            {
                $unwind: '$orderBy',
            },
            {
                $unwind: '$products',
            },
            {
                $lookup: {
                    from: 'productdetails',
                    localField: 'products.productDetail',
                    foreignField: '_id',
                    as: 'productDetail',
                },
            },
            {
                $unwind: '$productDetail',
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productDetail.product',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            {
                $unwind: '$product',
            },
            {
                $addFields: {
                    'productDetail.product': {
                        $mergeObjects: ['$product'],
                    },
                },
            },
            {
                $lookup: {
                    from: 'variationoptions',
                    localField: 'products.variationOption',
                    foreignField: '_id',
                    as: 'variationOptions',
                },
            },
            {
                $lookup: {
                    from: 'variations',
                    localField: 'variationOptions.variationId',
                    foreignField: '_id',
                    as: 'variations',
                },
            },
            {
                $addFields: {
                    variationOption: {
                        $map: {
                            input: '$variationOptions',
                            as: 'option',
                            in: {
                                $mergeObjects: [
                                    '$$option',
                                    {
                                        variation: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$variations',
                                                        as: 'variation',
                                                        cond: {
                                                            $eq: [
                                                                '$$variation._id',
                                                                '$$option.variationId',
                                                            ],
                                                        },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            {
                $group: {
                    _id: '$_id',
                    orderBy: { $first: '$orderBy' },
                    status: { $first: '$status' },
                    createdAt: { $first: '$createdAt' },
                    products: {
                        $push: {
                            productDetail: '$productDetail',
                            quantity: '$products.quantity',
                            variationOption: '$variationOptions',
                        },
                    },
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    variations: 0,
                },
            },
        ]

        const orders = await Order.aggregate(pipeline)

        const totalOrders = await Order.countDocuments({
            orderBy: new mongoose.Types.ObjectId(_id),
        })

        if (!orders || orders.length === 0) {
            return responseData(res, 400, 1, 'No order found')
        }

        responseData(res, 200, 0, '', '', orders, page, pageSize, totalOrders)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getOrderByStatus = async (req, res) => {
    try {
        const { status } = req.params
        const { _id } = req.user
        const { page, pageSize } = req.query
        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
        const limit = parseInt(pageSize, 10)

        const pipeline = [
            {
                $match: {
                    orderBy: new mongoose.Types.ObjectId(_id),
                    status,
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'orderBy',
                    foreignField: '_id',
                    as: 'orderBy',
                },
            },
            {
                $unwind: '$orderBy',
            },
            {
                $unwind: '$products',
            },
            {
                $lookup: {
                    from: 'productdetails',
                    localField: 'products.productDetail',
                    foreignField: '_id',
                    as: 'productDetail',
                },
            },
            {
                $unwind: '$productDetail',
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productDetail.product',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            {
                $unwind: '$product',
            },
            {
                $addFields: {
                    'productDetail.product': {
                        $mergeObjects: ['$product'],
                    },
                },
            },
            {
                $lookup: {
                    from: 'variationoptions',
                    localField: 'products.variationOption',
                    foreignField: '_id',
                    as: 'variationOptions',
                },
            },
            {
                $lookup: {
                    from: 'variations',
                    localField: 'variationOptions.variationId',
                    foreignField: '_id',
                    as: 'variations',
                },
            },
            {
                $addFields: {
                    variationOption: {
                        $map: {
                            input: '$variationOptions',
                            as: 'option',
                            in: {
                                $mergeObjects: [
                                    '$$option',
                                    {
                                        variation: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$variations',
                                                        as: 'variation',
                                                        cond: {
                                                            $eq: [
                                                                '$$variation._id',
                                                                '$$option.variationId',
                                                            ],
                                                        },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            {
                $group: {
                    _id: '$_id',
                    orderBy: { $first: '$orderBy' },
                    status: { $first: '$status' },
                    createdAt: { $first: '$createdAt' },
                    products: {
                        $push: {
                            productDetail: '$productDetail',
                            quantity: '$products.quantity',
                            variationOption: '$variationOptions',
                        },
                    },
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            { $skip: +skip },
            { $limit: +limit },
            {
                $project: {
                    variations: 0,
                },
            },
        ]

        const orders = await Order.aggregate(pipeline)
        const totalOrders = await Order.countDocuments({ status })
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
        console.log('error: ', error)
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
            new mongoose.Types.ObjectId(_id),
            { status },
            { new: true }
        )
        if (!response) return responseData(res, 400, 1, 'Update status failed')
        responseData(res, 200, 0, 'Update status successfully', null, response)
    } catch (error) {
        console.log('error: ', error)
        responseData(res, 500, 1, error.message)
    }
}

const search = async (req, res) => {
    const { keyword, page, pageSize } = req.query
    const normalizedSearch = removeAccents(keyword).toLowerCase()
    const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
    const limit = parseInt(pageSize, 10)
    if (keyword.length > 0) {
        const orderPipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'orderBy',
                    foreignField: '_id',
                    as: 'userLookup',
                },
            },
            {
                $addFields: {
                    orderBy: {
                        $arrayElemAt: ['$userLookup', 0],
                    },
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
                    userLookup: 0,
                },
            },
        ]

        const { filteredItems, totalItems } = await performSearch(
            Order,
            orderPipeline,
            'orderBy',
            ['name', 'address'],
            normalizedSearch,
            skip,
            limit
        )

        return responseData(
            res,
            200,
            0,
            '',
            '',
            filteredItems,
            page,
            pageSize,
            totalItems
        )
    }
    responseData(res, 500, 1, 'No order found')
}

const filter = async (req, res) => {
    try {
        const { page, pageSize } = req.query
        const { minDate, maxDate } = req.body
        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
        const limit = parseInt(pageSize, 10)

        if (minDate && maxDate) {
            const min = new Date(minDate)
            const max = new Date(maxDate)
            console.log('min: ', min)
            if (isNaN(min.getTime()) || isNaN(max.getTime())) {
                return responseData(res, 400, 1, 'Invalid date format')
            }

            const pipeline = [
                {
                    $match: {
                        createdAt: { $gte: min, $lte: max },
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'orderBy',
                        foreignField: '_id',
                        as: 'userLookup',
                    },
                },
                {
                    $addFields: {
                        orderBy: {
                            $arrayElemAt: ['$userLookup', 0],
                        },
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
                        userLookup: 0,
                    },
                },
            ]
            const response = await Order.aggregate(pipeline)
            const total = await Order.countDocuments({
                createdAt: { $gte: min, $lte: max },
            })
            if (!response) return responseData(res, 404, 1, 'No order found')
            responseData(res, 200, 0, '', '', response, page, pageSize, total)
        }
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const getDataChart = async (req, res) => {
    try {
        const type = req.params.type
        if (!type) {
            return responseData(res, 400, 1, 'Type is required')
        }

        const pipeline = getPipelineByType(type)

        if (!pipeline.length) {
            return responseData(res, 400, 0, 'Invalid type')
        }

        const result = await Order.aggregate(pipeline)
        const finalResult = Array(12).fill(0)
        result.forEach(({ month, total }) => {
            finalResult[month - 1] = total
        })
        responseData(res, 200, 0, '', '', finalResult)
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    getAllUserOrders,
    getOrder,
    createOrder,
    updateStatus,
    getOrderByStatus,
    search,
    filter,
    getAllOrderByStatus,
    getDataChart,
}
