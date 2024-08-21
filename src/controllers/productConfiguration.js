const mongoose = require('mongoose')
const ProductConfiguration = require('../models/productConfiguration')
const ProductDetail = require('../models/productDetail')
const VariationOption = require('../models/variationOption')
const { responseData } = require('../utils/helpers')

const getAllConfigurations = async (req, res) => {
    try {
        const { page, pageSize } = req.query
        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
        const limit = parseInt(pageSize, 10)

        const pipeline = [
            {
                $lookup: {
                    from: 'productdetails',
                    localField: 'productDetailId',
                    foreignField: '_id',
                    as: 'productDetailLookup',
                },
            },
            {
                $addFields: {
                    productDetailId: {
                        $arrayElemAt: ['$productDetailLookup', 0],
                    },
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productDetailId.product',
                    foreignField: '_id',
                    as: 'productLookup',
                },
            },
            {
                $addFields: {
                    'productDetailId.product': {
                        $arrayElemAt: ['$productLookup', 0],
                    },
                },
            },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'productDetailId.product.brand',
                    foreignField: '_id',
                    as: 'brandLookup',
                },
            },
            {
                $addFields: {
                    'productDetailId.product.brand': {
                        $arrayElemAt: ['$brandLookup', 0],
                    },
                },
            },
            {
                $lookup: {
                    from: 'categoryitems',
                    localField: 'productDetailId.product.categoryItem',
                    foreignField: '_id',
                    as: 'categoryItemLookup',
                },
            },
            {
                $addFields: {
                    'productDetailId.product.categoryItem': {
                        $arrayElemAt: ['$categoryItemLookup', 0],
                    },
                },
            },
            {
                $unwind: '$variationOptionId',
            },
            {
                $lookup: {
                    from: 'variationoptions',
                    localField: 'variationOptionId',
                    foreignField: '_id',
                    as: 'variationOptionLookup',
                },
            },
            {
                $addFields: {
                    variationOptionId: {
                        $arrayElemAt: ['$variationOptionLookup', 0],
                    },
                },
            },
            {
                $lookup: {
                    from: 'variations',
                    localField: 'variationOptionId.variationId',
                    foreignField: '_id',
                    as: 'variationLookup',
                },
            },
            {
                $addFields: {
                    'variationOptionId.variationId': {
                        $arrayElemAt: ['$variationLookup', 0],
                    },
                },
            },
            {
                $group: {
                    _id: '$_id',
                    productDetailId: { $first: '$productDetailId' },
                    variationOptionId: { $push: '$variationOptionId' },
                },
            },
            { $skip: skip ? skip : 0 },
            { $limit: limit ? +limit : 5 },
            {
                $project: {
                    productDetailLookup: 0,
                    productLookup: 0,
                    brandLookup: 0,
                    categoryItemLookup: 0,
                    variationOptionLookup: 0,
                    variationLookup: 0,
                },
            },
        ]
        const configurations = await ProductConfiguration.aggregate(pipeline)
        const totalConfigurations = await ProductConfiguration.countDocuments()
        if (!configurations)
            return responseData(res, 404, 1, 'No configuration found')
        responseData(
            res,
            200,
            0,
            '',
            '',
            configurations,
            page,
            pageSize,
            totalConfigurations
        )
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createConfiguration = async (req, res) => {
    try {
        const { data } = req
        const productDetail = await ProductDetail.findById(
            new mongoose.Types.ObjectId(data.productDetailId)
        )
        if (!productDetail) {
            return responseData(res, 404, 1, 'No product detail found')
        }

        const variationOptions = await VariationOption.find({
            _id: {
                $in: data.variationOptionId
                    .split(', ')
                    .map((id) => new mongoose.Types.ObjectId(id)),
            },
        })

        if (
            variationOptions.length !==
            data.variationOptionId.split(', ').length
        ) {
            return responseData(
                res,
                404,
                1,
                'One or more variation options not found'
            )
        }

        const existingConfigurations = await ProductConfiguration.find({
            productDetailId: new mongoose.Types.ObjectId(data.productDetailId),
        })

        const newVariationOptionId = data.variationOptionId
            .split(', ')
            .map((id) => id.toString())

        const isDuplicate = existingConfigurations.some((config) => {
            const existingVariationOptionId = config.variationOptionId.map(
                (id) => id.toString()
            )
            return newVariationOptionId.every((id) =>
                existingVariationOptionId.includes(id)
            )
        })

        if (isDuplicate) {
            return responseData(
                res,
                400,
                1,
                'Variation options already exist in configuration'
            )
        }

        const response = await ProductConfiguration.create({
            productDetailId: new mongoose.Types.ObjectId(data.productDetailId),
            variationOptionId: data.variationOptionId
                .split(', ')
                .map((id) => new mongoose.Types.ObjectId(id)),
        })
        if (!response) {
            return responseData(
                res,
                400,
                1,
                'Product configuration creation failed'
            )
        }
        responseData(res, 201, 0, '', 'Create configuration successfully')
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const updateConfiguration = async (req, res) => {
    try {
        const {
            data,
            params: { _id },
        } = req

        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid product configuration id')
        }

        const productDetail = await ProductDetail.findById(
            new mongoose.Types.ObjectId(data.productDetailId)
        )
        if (!productDetail) {
            return responseData(res, 404, 1, 'Product detail not found')
        }

        const variationOptions = await VariationOption.find({
            _id: {
                $in: data.variationOptionId
                    .split(', ')
                    .map((id) => new mongoose.Types.ObjectId(id)),
            },
        })

        if (
            variationOptions.length !==
            data.variationOptionId.split(', ').length
        ) {
            return responseData(
                res,
                404,
                1,
                'One or more variation options not found'
            )
        }

        const existingConfigurations = await ProductConfiguration.find({
            _id: { $ne: _id },
            productDetailId: new mongoose.Types.ObjectId(data.productDetailId),
        })

        const newVariationOptionIds = data.variationOptionId
            .split(', ')
            .map((id) => id.toString())

        const isDuplicate = existingConfigurations.some((config) => {
            const existingVariationOptionIds = config.variationOptionId.map(
                (id) => id.toString()
            )
            return (
                newVariationOptionIds.length ===
                    existingVariationOptionIds.length &&
                newVariationOptionIds.every((id) =>
                    existingVariationOptionIds.includes(id)
                )
            )
        })

        if (isDuplicate) {
            return responseData(
                res,
                400,
                1,
                'Configuration with the same productDetailId and variationOptionIds already exists'
            )
        }

        const response = await ProductConfiguration.findByIdAndUpdate(
            _id,
            {
                productDetailId: new mongoose.Types.ObjectId(
                    data.productDetailId
                ),
                variationOptionId: data.variationOptionId
                    .split(', ')
                    .map((id) => new mongoose.Types.ObjectId(id)),
            },
            {
                new: true,
            }
        )

        if (!response) {
            return responseData(res, 400, 1, 'No product configuration updated')
        }

        responseData(res, 200, 0, 'Product configuration updated successfully')
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const deleteProductConfiguration = async (req, res) => {
    try {
        const {
            params: { _id },
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }

        const response = await ProductConfiguration.findByIdAndDelete(_id)
        if (!response) return responseData(res, 400, 1, 'No product deleted')
        responseData(res, 201, 0, `Product deleted successfully`)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getConfigurationByDetail = async (req, res) => {
    try {
        const { slug } = req.params
        const { page, pageSize } = req.query
        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
        const limit = parseInt(pageSize, 10)

        const pipeline = [
            {
                $lookup: {
                    from: 'productdetails',
                    localField: 'productDetailId',
                    foreignField: '_id',
                    as: 'productDetailLookup',
                },
            },
            {
                $addFields: {
                    productDetailId: {
                        $arrayElemAt: ['$productDetailLookup', 0],
                    },
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productDetailId.product',
                    foreignField: '_id',
                    as: 'productLookup',
                },
            },
            {
                $addFields: {
                    'productDetailId.product': {
                        $arrayElemAt: ['$productLookup', 0],
                    },
                },
            },
            {
                $match: {
                    'productLookup.slug': slug,
                },
            },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'productDetailId.product.brand',
                    foreignField: '_id',
                    as: 'brandLookup',
                },
            },
            {
                $addFields: {
                    'productDetailId.product.brand': {
                        $arrayElemAt: ['$brandLookup', 0],
                    },
                },
            },
            {
                $lookup: {
                    from: 'categoryitems',
                    localField: 'productDetailId.product.categoryItem',
                    foreignField: '_id',
                    as: 'categoryItemLookup',
                },
            },
            {
                $addFields: {
                    'productDetailId.product.categoryItem': {
                        $arrayElemAt: ['$categoryItemLookup', 0],
                    },
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productDetailId.product.categoryItem.category',
                    foreignField: '_id',
                    as: 'categoryLookup',
                },
            },
            {
                $addFields: {
                    'productDetailId.product.categoryItem.category': {
                        $arrayElemAt: ['$categoryLookup', 0],
                    },
                },
            },
            {
                $unwind: '$variationOptionId',
            },
            {
                $lookup: {
                    from: 'variationoptions',
                    localField: 'variationOptionId',
                    foreignField: '_id',
                    as: 'variationOptionLookup',
                },
            },
            {
                $addFields: {
                    variationOptionId: {
                        $arrayElemAt: ['$variationOptionLookup', 0],
                    },
                },
            },
            {
                $lookup: {
                    from: 'variations',
                    localField: 'variationOptionId.variationId',
                    foreignField: '_id',
                    as: 'variationLookup',
                },
            },
            {
                $addFields: {
                    'variationOptionId.variationId': {
                        $arrayElemAt: ['$variationLookup', 0],
                    },
                },
            },
            {
                $group: {
                    _id: '$_id',
                    minPrice: { $min: '$productDetailId.price' },
                    maxPrice: { $max: '$productDetailId.price' },
                    productDetailId: { $first: '$productDetailId' },
                    variationOptionId: { $push: '$variationOptionId' },
                },
            },
            { $skip: skip ? skip : 0 },
            { $limit: limit ? +limit : 5 },
            {
                $project: {
                    'configurations.productDetailLookup': 0,
                    'configurations.productLookup': 0,
                    'configurations.brandLookup': 0,
                    'configurations.categoryItemLookup': 0,
                    'configurations.categoryLookup': 0,
                    'configurations.variationOptionLookup': 0,
                    'configurations.productLookup': 0,
                    'configurations.variationLookup': 0,
                },
            },
        ]

        const response = await ProductConfiguration.aggregate(pipeline)
        const totalConfigurations = await ProductConfiguration.countDocuments({
            'productDetailId.product.slug': slug,
        })

        if (!response || response.length === 0) {
            return responseData(res, 404, 1, 'No configuration found')
        }
        const allPrices = response.map((item) => item.productDetailId.price)
        const minPrice = Math.min(...allPrices)
        const maxPrice = Math.max(...allPrices)

        const result = {
            minPrice,
            maxPrice,
            configurations: response,
        }
        
        responseData(
            res,
            200,
            0,
            '',
            null,
            result,
            page,
            pageSize,
            totalConfigurations
        )
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    getAllConfigurations,
    createConfiguration,
    updateConfiguration,
    deleteProductConfiguration,
    getConfigurationByDetail,
}
