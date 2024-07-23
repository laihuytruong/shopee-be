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
        const variationOption = await VariationOption.findById(
            new mongoose.Types.ObjectId(data.variationOptionId)
        )
        if (!productDetail || !variationOption) {
            return responseData(
                res,
                404,
                1,
                'No product detail or no variation option'
            )
        }
        const response = await ProductConfiguration.create({
            productDetailId: new mongoose.Types.ObjectId(data.productDetailId),
            variationOptionId: new mongoose.Types.ObjectId(
                data.variationOptionId
            ),
        })
        if (!response) {
            return responseData(
                res,
                400,
                1,
                'Product configuration created failed'
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
        const variationOption = await VariationOption.findById(
            new mongoose.Types.ObjectId(data.variationOptionId)
        )
        if (!productDetail) {
            return responseData(res, 404, 1, 'Product detail not found')
        }
        if (!variationOption) {
            return responseData(res, 404, 1, 'Variation option not found')
        }

        const response = await ProductDetail.findByIdAndUpdate(
            _id,
            {
                productDetailId: new mongoose.Types.ObjectId(
                    data.productDetailId
                ),
                variationOptionId: new mongoose.Types.ObjectId(
                    data.variationOptionId
                ),
            },
            {
                new: true,
            }
        )
        console.log(response)
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
        const pipeline = [
            {
                $lookup: {
                    from: 'productdetails',
                    localField: 'productDetailId',
                    foreignField: '_id',
                    as: 'productDetailId',
                },
            },
            {
                $unwind: {
                    path: '$productDetailId',
                    preserveNullAndEmptyArrays: true,
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
                $lookup: {
                    from: 'variationoptions',
                    localField: 'variationOptionId',
                    foreignField: '_id',
                    as: 'variationOptionId',
                },
            },
            {
                $unwind: {
                    path: '$variationOptionId',
                    preserveNullAndEmptyArrays: true,
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
                    _id: null,
                    minPrice: { $min: '$productDetailId.price' },
                    maxPrice: { $max: '$productDetailId.price' },
                    configurations: { $push: '$$ROOT' },
                },
            },
            {
                $project: {
                    productLookup: 0,
                    variationLookup: 0,
                    categoryItemLookup: 0,
                    categoryLookup: 0,
                },
            },
        ]
        const response = await ProductConfiguration.aggregate(pipeline)
        if (!response || response.length === 0) {
            return responseData(res, 404, 1, 'No configuration found')
        }
        const result = response[0]
        responseData(res, 200, 0, '', null, result)
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
