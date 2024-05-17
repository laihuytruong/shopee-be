const mongoose = require('mongoose')
const Category = require('../models/category')
const { getFileNameCloudinary } = require('../utils/helpers')
const cloudinary = require('cloudinary').v2

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find()
        if (!categories)
            return res.status(404).json({
                err: 1,
                msg: 'No category found',
            })
        res.status(200).json({
            err: 0,
            categories: {
                count: categories.length,
                data: categories,
            },
        })
    } catch (error) {
        res.status(500).json({
            err: 1,
            msg: error.message,
        })
    }
}

const getOneCategory = async (req, res) => {
    try {
        const { _id } = req.params
        if (!mongoose.Types.ObjectId.isValid(_id))
            return res.status(400).json({
                err: 1,
                msg: 'Invalid category id',
            })
        const category = await Category.findById(
            new mongoose.Types.ObjectId(_id)
        )
        if (!category)
            return res.status(404).json({
                err: 1,
                msg: 'No category found',
            })
        res.status(200).json({
            err: 0,
            category,
        })
    } catch (error) {
        res.status(500).json({
            err: 1,
            msg: error.message,
        })
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
            return res.status(400).json({
                err: 1,
                msg: 'Category already exist',
            })
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
        if (!response && fileData)
            cloudinary.uploader.destroy(fileData.filename)
    } catch (error) {
        res.status(500).json({
            err: 1,
            msg: error.message,
        })
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
            return res.status(400).json({
                err: 1,
                msg: 'Invalid ID',
            })
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
        res.status(201).json({
            err: response ? 0 : 1,
            data: response
                ? 'Updated category successfully'
                : 'No category updated',
        })
        if (!response && fileData)
            cloudinary.uploader.destroy(fileData.filename)
    } catch (error) {
        res.status(500).json({
            err: 1,
            msg: error.message,
        })
        if (fileData) cloudinary.uploader.destroy(fileData.filename)
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id))
            return res.status(400).json({
                err: 1,
                msg: 'Invalid ID',
            })
        const response = await Category.findByIdAndDelete(_id)
        res.status(response ? 200 : 400).json({
            err: response ? 0 : 1,
            response: response
                ? `Category with categoryName ${response.categoryName} deleted`
                : 'No user deleted',
        })
        if (!response) {
            const filename = getFileNameCloudinary(response.thumbnail)
            cloudinary.uploader.destroy(filename)
        }
    } catch (error) {
        res.status(500).json({
            err: 1,
            msg: error.message,
        })
    }
}

module.exports = {
    getAllCategories,
    getOneCategory,
    createCategory,
    updateCategory,
    deleteCategory,
}
