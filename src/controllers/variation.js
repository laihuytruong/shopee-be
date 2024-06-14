const mongoose = require('mongoose')
const Variation = require('../models/variation')
const Category = require('../models/category')
const { responseData } = require('../utils/helpers')

const getAllVariations = async (req, res) => {
    try {
        const response = await Variation.find()
        if (!response) return responseData(res, 404, 1, 'No variation found')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createVariation = async (req, res) => {
    try {
        const { data, dataModel } = req
        if (dataModel) {
            return responseData(res, 400, 1, 'Variation already exist')
        }
        console.log('data: ', data)
        const category = await Category.findById(
            new mongoose.Types.ObjectId(data.categoryId)
        )
        if (!category) {
            return responseData(res, 404, 1, 'Category does not exist')
        }
        const response = await Variation.create({
            categoryId: new mongoose.Types.ObjectId(data.categoryId),
            name: data.name.trim(),
        })
        if (!response) {
            return responseData(res, 400, 1, 'Variation created failed')
        }
        responseData(res, 201, 0, '', null, response)
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const updateVariation = async (req, res) => {
    try {
        const {
            data,
            params: { _id },
            dataModel,
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid variation id')
        }
        if (dataModel) {
            return responseData(res, 400, 1, 'Variation already exist')
        }
        const category = await Category.findById(
            new mongoose.Types.ObjectId(data.categoryId)
        )
        if (!category) {
            return responseData(res, 404, 1, 'Category does not exist')
        }

        const response = await Variation.findByIdAndUpdate(
            _id,
            {
                categoryId: new mongoose.Types.ObjectId(data.categoryId),
                name: data.name.trim(),
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
    createVariation,
    updateVariation,
    deleteVariation,
}
