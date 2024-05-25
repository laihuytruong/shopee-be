const Brand = require('../models/brand')
const Category = require('../models/category')
const { responseData, getFileNameCloudinary } = require('../utils/helpers')
const mongoose = require('mongoose')
const cloudinary = require('cloudinary').v2

const getAllBrands = async (req, res) => {
    try {
        const queries = { ...req.query }
        const excludeFields = ['limit', 'page']
        excludeFields.forEach((el) => delete queries[el])

        let queryCommand = Brand.find().populate('category')

        const page = +req.query.page || 1
        const limit = +req.query.limit || 5
        const skip = (page - 1) * limit
        queryCommand.skip(skip).limit(limit)

        const response = await queryCommand
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
        const response = await Brand.findById(_id).populate('category')
        if (!response) return responseData(res, 400, 1, 'Cannot get brand')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createBrand = async (req, res) => {
    try {
        const {
            body: { brandName, category, image },
            dataModel,
        } = req
        if (!brandName) {
            return responseData(res, 400, 1, 'Brand name cannot be empty')
        }
        if (dataModel) return responseData(res, 400, 1, 'Brand already exist')
        const categoryData = await Category.findById(
            new mongoose.Types.ObjectId(category)
        )
        if (!categoryData)
            return responseData(res, 404, 1, 'Category does not exist')
        let response
        if (!image) {
            response = await Brand.create({
                brandName,
                category: new mongoose.Types.ObjectId(category),
            })
        } else {
            response = await Brand.create({
                brandName,
                image,
                category: new mongoose.Types.ObjectId(category),
            })
        }
        if (!response) {
            return responseData(res, 400, 1, 'Create brand failed')
        }
        responseData(res, 201, 0, 'Create brand successfully', null, response)
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const updateBrand = async (req, res) => {
    try {
        const {
            body: { brandName, category, image },
            params: { _id },
            dataModel,
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        if (!brandName) {
            return responseData(res, 400, 1, 'Brand name cannot be empty')
        }

        if (dataModel) return responseData(res, 400, 1, 'Brand already exist')
        const categoryData = await Category.findById(
            new mongoose.Types.ObjectId(category)
        )
        if (!categoryData)
            return responseData(res, 404, 1, 'Category does not exist')
        let response
        if (!image) {
            response = await Brand.findByIdAndUpdate(
                _id,
                {
                    brandName,
                    category: new mongoose.Types.ObjectId(category),
                },
                { new: true }
            )
        } else {
            response = await Brand.findByIdAndUpdate(
                _id,
                {
                    brandName,
                    image,
                    category: new mongoose.Types.ObjectId(category),
                },
                { new: true }
            )
        }
        if (!response) {
            return responseData(res, 400, 1, 'No brand updated')
        }
        responseData(res, 200, 0, 'Update brand successfully')
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
        cloudinary.uploader.destroy(getFileNameCloudinary(response.image))
        responseData(res, 200, 0, 'Delete brand successfully', null, null)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const uploadImageBrand = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        if (!req.file) return responseData(res, 400, 1, 'No image upload')
        const response = await Brand.findByIdAndUpdate(
            _id,
            {
                image: req.file.path,
            },
            { new: true }
        )
        console.log(response)
        if (!response) {
            cloudinary.uploader.destroy(req.file.filename)
            return responseData(res, 400, 1, 'Upload image failed')
        }
        responseData(res, 200, 0, `Upload image successful`)
    } catch (error) {
        responseData(res, 500, 1, error.message)
        if (req.file) cloudinary.uploader.destroy(req.file.filename)
    }
}

const getBrandSBySlug = async (req, res) => {
    try {
        const { slug } = req.params
        const filterCategory = await Category.find({
            slug,
        })
        const response = await Brand.find({
            category: filterCategory[0]._id,
        })
        if (!response)
            return responseData(res, 404, 1, 'No category item found')
        responseData(res, 200, 0, '', null, response)
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
    uploadImageBrand,
    getBrandSBySlug,
}
