const mongoose = require('mongoose')
const Variation = require('../models/variation')
const Category = require('../models/category')
const { responseData } = require('../utils/helpers')

const getAllVariations = async (req, res) => {
    try {
        const { page, pageSize } = req.query
        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
        const limit = parseInt(pageSize, 10)

        const pipeline = [
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'categoryLookup',
                },
            },
            {
                $addFields: {
                    categoryId: {
                        $arrayElemAt: ['$categoryLookup', 0],
                    },
                },
            },
            { $skip: skip ? skip : 0 },
            { $limit: limit ? +limit : 5 },
            {
                $project: {
                    categoryLookup: 0,
                },
            },
        ]
        const variations = await Variation.aggregate(pipeline)
        const totalVariations = await Variation.countDocuments()
        if (!variations) return responseData(res, 404, 1, 'No variation found')
        responseData(
            res,
            200,
            0,
            '',
            '',
            variations,
            page,
            pageSize,
            totalVariations
        )
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getVariationByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params
        const category = await Category.findById(
            new mongoose.Types.ObjectId(categoryId)
        )
        if (!category) return responseData(res, 404, 1, 'No category found')

        const pipeline = [
            {
                $match: {
                    categoryId: category._id,
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'categoryLookup',
                },
            },
            {
                $addFields: {
                    categoryId: {
                        $arrayElemAt: ['$categoryLookup', 0],
                    },
                },
            },
            {
                $project: {
                    categoryLookup: 0,
                },
            },
        ]
        const variations = await Variation.aggregate(pipeline)
        if (!variations) return responseData(res, 404, 1, 'No variation found')
        responseData(res, 200, 0, '', '', variations)
    } catch (error) {
        console.log('error: ' + error)
        responseData(res, 500, 1, error.message)
    }
}

const createVariation = async (req, res) => {
    try {
        const { categoryId, name } = req.body
        const category = await Category.findById(
            new mongoose.Types.ObjectId(categoryId)
        )
        if (!category) {
            return responseData(res, 404, 1, 'Category does not exist')
        }
        const response = await Variation.create({
            categoryId: new mongoose.Types.ObjectId(categoryId),
            name: name.trim(),
        })
        if (!response) {
            return responseData(res, 400, 1, 'Variation created failed')
        }
        responseData(res, 201, 0, '', 'Created variation successfully')
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const updateVariation = async (req, res) => {
    try {
        const {
            params: { _id },
            body: { categoryId, name },
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid variation id')
        }
        const category = await Category.findById(
            new mongoose.Types.ObjectId(categoryId)
        )
        if (!category) {
            return responseData(res, 404, 1, 'Category does not exist')
        }

        const response = await Variation.findByIdAndUpdate(
            _id,
            {
                categoryId: new mongoose.Types.ObjectId(categoryId),
                name: name.trim(),
            },
            {
                new: true,
            }
        )
        if (!response) {
            return responseData(res, 400, 1, 'No variation updated')
        }
        responseData(res, 200, 0, 'Variation updated successfully')
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const deleteVariation = async (req, res) => {
    try {
        const {
            params: { _id },
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        const response = await Variation.findByIdAndDelete(_id)
        if (!response) return responseData(res, 400, 1, 'No variation deleted')
        responseData(res, 201, 0, `Variation deleted successfully`)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    getAllVariations,
    getVariationByCategory,
    createVariation,
    updateVariation,
    deleteVariation,
}
