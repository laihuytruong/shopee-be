const Brand = require('../models/brand')
const { responseData } = require('../utils/helpers')
const mongoose = require('mongoose')

const getAllBrands = async (req, res) => {
    try {
        const response = await Brand.find()
        if (!response) return responseData(res, 400, 1, 'Cannot get brands')
        responseData(res, 200, 0, '', response.length, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getBrand = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        const response = await Brand.findById(_id)
        if (!response) return responseData(res, 400, 1, 'Cannot get brand')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createBrand = async (req, res) => {
    try {
        const {
            body: { brandName },
            dataModel,
        } = req
        if (!brandName) {
            return responseData(res, 400, 1, 'Brand name cannot be empty')
        }
        if (dataModel) return responseData(res, 400, 1, 'Brand already exist')
        const response = await Brand.create({ brandName })
        console.log(response)
        if (!response) return responseData(res, 400, 1, 'Create brand failed')
        responseData(res, 201, 0, 'Create brand successfully', null, response)
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const updateBrand = async (req, res) => {
    try {
        const {
            body: { brandName },
            params: { _id },
            dataModel,
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        if (!brandName) {
            return responseData(res, 400, 1, 'brand name cannot be empty')
        }

        if (dataModel) return responseData(res, 400, 1, 'Brand already exist')
        const response = await Brand.findByIdAndUpdate(
            _id,
            { brandName },
            { new: true }
        )
        if (!response) return responseData(res, 400, 1, 'Update brand failed')
        responseData(res, 200, 0, 'Update brand successfully', null, null)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const deleteBrand = async (req, res) => {
    try {
        const {
            params: { _id },
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        const response = await Brand.findByIdAndDelete(_id)
        if (!response) return responseData(res, 400, 1, 'Delete brand failed')
        responseData(res, 200, 0, 'Delete brand successfully', null, null)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    getAllBrands,
    getBrand,
    createBrand,
    updateBrand,
    deleteBrand,
}
