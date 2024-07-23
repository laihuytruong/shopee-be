const Brand = require('../models/brand')
const Category = require('../models/category')
const {
    responseData,
    getFileNameCloudinary,
    generateSlug,
} = require('../utils/helpers')
const mongoose = require('mongoose')
const cloudinary = require('cloudinary').v2

const getAllBrands = async (req, res) => {
    try {
        const { page, pageSize } = req.query
        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
        const limit = parseInt(pageSize, 10)

        const pipeline = [
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryLookup',
                },
            },
            {
                $addFields: {
                    category: {
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
        const brands = await Brand.aggregate(pipeline)
        const totalBrands = await Brand.countDocuments()
        if (!brands) return responseData(res, 404, 1, 'No brand found')
        responseData(res, 200, 0, '', '', brands, page, pageSize, totalBrands)
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
        const response = await Brand.find({
            category: new mongoose.Types.ObjectId(_id),
        }).populate('category')
        if (!response) return responseData(res, 400, 1, 'Cannot get brand')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createBrand = async (req, res) => {
    try {
        const { brandName, category } = req.body
        if (!brandName) {
            return responseData(res, 400, 1, 'Brand name cannot be empty')
        }
        const categoryData = await Category.findById(
            new mongoose.Types.ObjectId(category)
        )
        if (!categoryData)
            return responseData(res, 404, 1, 'Category does not exist')
        const response = await Brand.create({
            brandName,
            slug: generateSlug(brandName),
            category: new mongoose.Types.ObjectId(category),
        })
        if (!response) {
            return responseData(res, 400, 1, 'Create brand failed')
        }
        responseData(res, 201, 0, 'Create brand successfully')
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const updateBrand = async (req, res) => {
    try {
        const {
            body: { brandName, category },
            params: { _id },
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        const categoryData = await Category.findById(
            new mongoose.Types.ObjectId(category)
        )
        if (!categoryData)
            return responseData(res, 404, 1, 'Category does not exist')
        const response = await Brand.findByIdAndUpdate(
            _id,
            {
                brandName,
                slug: generateSlug(brandName),
                category: new mongoose.Types.ObjectId(category),
            },
            { new: true }
        )
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
        responseData(res, 200, 0, 'Delete brand successfully')
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getBrandsBySlug = async (req, res) => {
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
    getBrandsBySlug,
}
