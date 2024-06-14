const mongoose = require('mongoose')
const Variation = require('../models/variation')
const VariationOption = require('../models/variationOption')
const { responseData } = require('../utils/helpers')

const getAllOptions = async (req, res) => {
    try {
        const response = await VariationOption.find()
        if (!response) return responseData(res, 404, 1, 'No option found')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createOption = async (req, res) => {
    try {
        const { data, dataModel } = req
        if (dataModel) {
            return responseData(res, 400, 1, 'Option already exist')
        }
        const variation = await Variation.findById(
            new mongoose.Types.ObjectId(data.variationId)
        )
        if (!variation) {
            return responseData(res, 404, 1, 'Variation does not exist')
        }
        const response = await VariationOption.create({
            variationId: new mongoose.Types.ObjectId(data.variationId),
            value: data.value,
        })
        if (!response) {
            return responseData(res, 400, 1, 'Option created failed')
        }
        responseData(res, 201, 0, '', null, response)
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const updateOption = async (req, res) => {
    try {
        const {
            data,
            params: { _id },
            dataModel,
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid option id')
        }
        if (dataModel) {
            return responseData(res, 400, 1, 'Variation option already exist')
        }
        const variation = await Variation.findById(
            new mongoose.Types.ObjectId(data.variationId)
        )
        if (!variation) {
            return responseData(res, 404, 1, 'Variation does not exist')
        }

        const response = await VariationOption.findByIdAndUpdate(
            _id,
            {
                variationId: new mongoose.Types.ObjectId(data.variationId),
                value: data.value,
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
    createOption,
    updateOption,
    deleteOption,
}
