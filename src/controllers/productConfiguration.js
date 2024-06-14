const mongoose = require('mongoose')
const ProductConfiguration = require('../models/productConfiguration')
const ProductDetail = require('../models/productDetail')
const VariationOption = require('../models/variationOption')
const { responseData } = require('../utils/helpers')

const getAllConfigurations = async (req, res) => {
    try {
        const response = await ProductConfiguration.find()
        if (!response)
            return responseData(res, 404, 1, 'No product configuration found')
        responseData(res, 200, 0, '', null, response)
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
        responseData(res, 201, 0, '', null, response)
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

module.exports = {
    getAllConfigurations,
    createConfiguration,
    updateConfiguration,
    deleteProductConfiguration,
}
