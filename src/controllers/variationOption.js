const mongoose = require('mongoose')
const Variation = require('../models/variation')
const VariationOption = require('../models/variationOption')
const { responseData } = require('../utils/helpers')

const getAllOptions = async (req, res) => {
    try {
        const { page, pageSize } = req.query
        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
        const limit = parseInt(pageSize, 10)

        const pipeline = [
            {
                $lookup: {
                    from: 'variations',
                    localField: 'variationId',
                    foreignField: '_id',
                    as: 'variationLookup',
                },
            },
            {
                $addFields: {
                    variationId: {
                        $arrayElemAt: ['$variationLookup', 0],
                    },
                },
            },
            { $skip: skip ? skip : 0 },
            { $limit: limit ? +limit : 5 },
            {
                $project: {
                    variationLookup: 0,
                },
            },
        ]
        const variationOptions = await VariationOption.aggregate(pipeline)
        const totalVariationOptions = await VariationOption.countDocuments()
        if (!variationOptions)
            return responseData(res, 404, 1, 'No variation option found')
        responseData(
            res,
            200,
            0,
            '',
            '',
            variationOptions,
            page,
            pageSize,
            totalVariationOptions
        )
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getOptionByVariationId = async (req, res) => {
    try {
        const { _id } = req.params
        const pipeline = [
            {
                $match: {
                    variationId: new mongoose.Types.ObjectId(_id),
                },
            },
            {
                $lookup: {
                    from: 'variations',
                    localField: 'variationId',
                    foreignField: '_id',
                    as: 'variationLookup',
                },
            },
            {
                $addFields: {
                    variationId: {
                        $arrayElemAt: ['$variationLookup', 0],
                    },
                },
            },
            {
                $project: {
                    variationLookup: 0,
                },
            },
        ]
        const variationOptions = await VariationOption.aggregate(pipeline)
        if (!variationOptions)
            return responseData(res, 404, 1, 'No variation option found')
        responseData(res, 200, 0, '', '', variationOptions)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createOption = async (req, res) => {
    try {
        const { variationId, value } = req.body
        const variation = await Variation.findById(
            new mongoose.Types.ObjectId(variationId)
        )
        if (!variation) {
            return responseData(res, 404, 1, 'Variation does not exist')
        }
        const response = await VariationOption.create({
            variationId: new mongoose.Types.ObjectId(variationId),
            value: value.trim(),
        })
        if (!response) {
            return responseData(res, 400, 1, 'Option created failed')
        }
        responseData(res, 201, 0, 'Created option successfully')
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const updateOption = async (req, res) => {
    try {
        const {
            params: { _id },
            body: { variationId, value },
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid option id')
        }
        const variation = await Variation.findById(
            new mongoose.Types.ObjectId(variationId)
        )
        if (!variation) {
            return responseData(res, 404, 1, 'Variation does not exist')
        }

        const response = await VariationOption.findByIdAndUpdate(
            _id,
            {
                variationId: new mongoose.Types.ObjectId(variationId),
                value: value.trim(),
            },
            {
                new: true,
            }
        )
        if (!response) {
            return responseData(res, 400, 1, 'No option updated')
        }
        responseData(res, 200, 0, 'Option updated successfully')
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const deleteOption = async (req, res) => {
    try {
        const {
            params: { _id },
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        const response = await VariationOption.findByIdAndDelete(_id)
        if (!response) return responseData(res, 400, 1, 'No option deleted')
        responseData(res, 201, 0, `Option deleted successfully`)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    getAllOptions,
    getOptionByVariationId,
    createOption,
    updateOption,
    deleteOption,
}
