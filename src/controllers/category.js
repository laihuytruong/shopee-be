const mongoose = require('mongoose')
const Category = require('../models/category')
const { getFileNameCloudinary, responseData } = require('../utils/helpers')
const cloudinary = require('cloudinary').v2

const getAllCategories = async (req, res) => {
    try {
        const response = await Category.find()
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
        )
        if (!response) return responseData(res, 404, 1, 'No category found')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createCategory = async (req, res) => {
    const fileData = req.file
    console.log(fileData)
    try {
        const {
            data: { categoryName },
            dataModel,
        } = req
        console.log('fileData: ', fileData)
        if (dataModel) {
            if (fileData) cloudinary.uploader.destroy(fileData.filename)
            return responseData(res, 400, 1, 'Category already exist')
        }
        const newCategory = {
            categoryName,
            thumbnail: fileData?.path,
        }
        const response = await Category.create(newCategory)
        res.status(response ? 201 : 400).json({
            err: response ? 0 : 1,
            data: response ? response : {},
        })
        if (!response)
            return responseData(res, 400, 1, 'Create category failed')
        responseData(
            res,
            201,
            0,
            'Create category successfully',
            null,
            response
        )
        if (!response && fileData)
            cloudinary.uploader.destroy(fileData.filename)
    } catch (error) {
        responseData(res, 500, 1, error.message)
        if (fileData) cloudinary.uploader.destroy(fileData.filename)
    }
}

const updateCategory = async (req, res) => {
    const fileData = req.file
    try {
        const { categoryName } = req.data
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            if (fileData) cloudinary.uploader.destroy(fileData.filename)
            return responseData(res, 400, 1, 'Invalid ID')
        }
        const response = await Category.findByIdAndUpdate(
            _id,
            {
                categoryName,
                thumbnail: fileData?.path,
            },
            {
                new: true,
            }
        )
        if (!response) return responseData(res, 400, 1, 'No category updated')
        responseData(res, 200, 0, 'Updated category successfully')
        if (!response && fileData)
            cloudinary.uploader.destroy(fileData.filename)
    } catch (error) {
        responseData(res, 500, 1, error.message)
        if (fileData) cloudinary.uploader.destroy(fileData.filename)
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id))
            return responseData(res, 400, 1, 'Invalid ID')
        const response = await Category.findByIdAndDelete(_id)
        if (!response) {
            const filename = getFileNameCloudinary(response.thumbnail)
            cloudinary.uploader.destroy(filename)
            return responseData(res, 400, 1, 'No user deleted')
        }
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
