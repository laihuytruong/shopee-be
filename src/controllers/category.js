const mongoose = require('mongoose')
const Category = require('../models/category')
const {
    responseData,
    generateSlug,
    getFileNameCloudinary,
    paginationSortSearch,
} = require('../utils/helpers')
const cloudinary = require('cloudinary').v2

const getAllCategories = async (req, res) => {
    try {
        const { page, pageSize } = req.query
        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
        const limit = parseInt(pageSize, 10)
        const pipeline = [
            { $skip: skip ? skip : 0 },
            { $limit: limit ? +limit : 5 },
        ]
        const categories = await Category.aggregate(pipeline)
        const totalCategories = await Category.countDocuments()
        if (!categories && categories.length === 0)
            return responseData(res, 404, 1, 'No category found')
        responseData(
            res,
            200,
            0,
            '',
            '',
            categories,
            page,
            pageSize,
            totalCategories
        )
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
        const { categoryName } = req.body
        const thumbnail = req.file.path

        const response = await Category.create({
            categoryName,
            slug: generateSlug(categoryName),
            thumbnail,
        })
        if (!response) {
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
    }
}

const updateCategory = async (req, res) => {
    try {
        const {
            params: { _id },
            body: { categoryName },
        } = req
        const thumbnail = req.file
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }

        let response

        if (!thumbnail) {
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
                    thumbnail: thumbnail.path,
                },
                {
                    new: true,
                }
            )
        }

        if (!response) {
            return responseData(res, 400, 1, 'No category updated')
        }
        responseData(res, 200, 0, 'Updated category successfully')
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id))
            return responseData(res, 400, 1, 'Invalid ID')
        const response = await Category.findByIdAndDelete(_id)
        if (!response) return responseData(res, 400, 1, 'No category deleted')
        cloudinary.uploader.destroy(getFileNameCloudinary(response.thumbnail))
        responseData(res, 200, 0, `Deleted category successfully`)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const uploadImageCategory = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        if (!req.file) return responseData(res, 400, 1, 'No image upload')
        const response = await Category.findByIdAndUpdate(
            _id,
            {
                thumbnail: req.file.path,
            },
            { new: true }
        )
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

module.exports = {
    getAllCategories,
    getOneCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadImageCategory,
}
