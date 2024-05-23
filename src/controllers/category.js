const mongoose = require('mongoose')
const Category = require('../models/category')
const { responseData, generateSlug } = require('../utils/helpers')
const cloudinary = require('cloudinary').v2

const getAllCategories = async (req, res) => {
    try {
        const response = await Category.find().select(
            '_id categoryName slug thumbnail'
        )
        console.log('response: ', response)
        if (!response) return responseData(res, 404, 1, 'No category found')
        responseData(res, 200, 0, '', response.length, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getOneCategory = async (req, res) => {
    try {
        const { _id } = req.params
        if (!mongoose.Types.ObjectId.isValid(_id))
            return responseData(res, 400, 1, 'Invalid category id')
        const response = await Category.findById(
            new mongoose.Types.ObjectId(_id)
        ).select('_id categoryName slug thumbnail')
        if (!response) return responseData(res, 404, 1, 'No category found')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createCategory = async (req, res) => {
    try {
        const {
            dataModel,
            data: { categoryName },
            file,
        } = req
        console.log(file)
        if (!file) return responseData(res, 400, 1, 'Missing input')
        if (dataModel) {
            return responseData(res, 400, 1, 'Category already exist')
        }
        const response = await Category.create({
            categoryName,
            slug: generateSlug(categoryName),
            thumbnail: file.path,
        })
        if (!response) {
            cloudinary.uploader.destroy(file.filename)
            return responseData(res, 400, 1, 'Create category failed')
        }
        responseData(
            res,
            201,
            0,
            'Create category successfully',
            null,
            response
        )
    } catch (error) {
        responseData(res, 500, 1, error.message)
        if (req.file) cloudinary.uploader.destroy(file.filename)
    }
}

const updateCategory = async (req, res) => {
    try {
        const {
            params: { _id },
            data: { categoryName },
            file,
        } = req
        // if (!file) return responseData(res, 400, 1, 'Missing input')
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        let response
        if (!file) {
            response = await Category.findByIdAndUpdate(
                _id,
                {
                    categoryName,
                    slug: generateSlug(categoryName),
                },
                {
                    new: true,
                }
            )
        } else {
            response = await Category.findByIdAndUpdate(
                _id,
                {
                    categoryName,
                    slug: generateSlug(categoryName),
                    thumbnail: file.path,
                },
                {
                    new: true,
                }
            )
        }

        if (!response) {
            cloudinary.uploader.destroy(file.filename)
            return responseData(res, 400, 1, 'No category updated')
        }
        responseData(res, 200, 0, 'Updated category successfully')
    } catch (error) {
        responseData(res, 500, 1, error.message)
        if (req.file) cloudinary.uploader.destroy(file.filename)
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id))
            return responseData(res, 400, 1, 'Invalid ID')
        const response = await Category.findByIdAndDelete(_id)
        if (!response) return responseData(res, 400, 1, 'No user deleted')

        responseData(
            res,
            200,
            0,
            `Category with categoryName ${response.categoryName} deleted`
        )
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    getAllCategories,
    getOneCategory,
    createCategory,
    updateCategory,
    deleteCategory,
}
