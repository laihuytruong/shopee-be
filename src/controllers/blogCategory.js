const BlogCategory = require('../models/blogCategory')
const { responseData } = require('../utils/helpers')
const mongoose = require('mongoose')

const getAllBlogCategories = async (req, res) => {
    try {
        const response = await BlogCategory.find()
        if (!response)
            return responseData(res, 400, 1, 'Cannot get blog categories')
        responseData(res, 200, 0, '', response.length, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getBlogCategory = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        const response = await BlogCategory.findById(_id)
        if (!response)
            return responseData(res, 400, 1, 'Cannot get blog category')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createBlogCategory = async (req, res) => {
    try {
        const {
            body: { blogCategoryName },
            dataModel,
        } = req
        if (!blogCategoryName) {
            return responseData(
                res,
                400,
                1,
                'Blog category name cannot be empty'
            )
        }
        if (dataModel)
            return responseData(res, 400, 1, 'Blog category already exist')
        const response = await BlogCategory.create({ blogCategoryName })
        console.log(response)
        if (!response)
            return responseData(res, 400, 1, 'Create blog category failed')
        responseData(
            res,
            201,
            0,
            'Create blog category successfully',
            null,
            response
        )
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const updateBlogCategory = async (req, res) => {
    try {
        const {
            body: { blogCategoryName },
            params: { _id },
            dataModel,
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        if (!blogCategoryName) {
            return responseData(
                res,
                400,
                1,
                'Blog category name cannot be empty'
            )
        }

        if (dataModel)
            return responseData(res, 400, 1, 'Blog category already exist')
        const response = await BlogCategory.findByIdAndUpdate(
            _id,
            { blogCategoryName },
            { new: true }
        )
        if (!response)
            return responseData(res, 400, 1, 'Update blog category failed')
        responseData(
            res,
            200,
            0,
            'Update blog category successfully',
            null,
            null
        )
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const deleteBlogCategory = async (req, res) => {
    try {
        const {
            params: { _id },
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        const response = await BlogCategory.findByIdAndDelete(_id)
        if (!response)
            return responseData(res, 400, 1, 'Delete blog category failed')
        responseData(
            res,
            200,
            0,
            'Delete blog category successfully',
            null,
            null
        )
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    getAllBlogCategories,
    getBlogCategory,
    createBlogCategory,
    updateBlogCategory,
    deleteBlogCategory,
}
