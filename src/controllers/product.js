const mongoose = require('mongoose')
const Product = require('../models/product')
const Category = require('../models/category')
const Brand = require('../models/brand')
const { generateSlug, responseData } = require('../utils/helpers')

const getAllProducts = async (req, res) => {
    try {
        const queries = { ...req.query }
        console.log(req.query)
        const excludeFields = ['limit', 'sort', 'page', 'fields']
        excludeFields.forEach((el) => delete queries[el])

        let queryString = JSON.stringify(queries)
        queryString = queryString.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (matchedEl) => `$${matchedEl}`
        )
        const formattedQueries = JSON.parse(queryString)

        // Filtering
        if (queries?.productName)
            formattedQueries.productName = {
                $regex: queries.productName,
                $options: 'i',
            }
        let queryCommand = Product.find(formattedQueries)
            .populate('brand', 'brandName')
            .populate('category', 'categoryName', 'Category')

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort
                .split(',')
                .map((item) => item.trim())
                .join(' ')
            queryCommand = queryCommand.sort(sortBy)
        }

        // Fields limiting
        if (req.query.fields) {
            const fields = req.query.fields
                .split(',')
                .map((item) => item.trim())
                .join(' ')
            queryCommand = queryCommand.select(fields)
        }

        // Pagination
        const page = +req.query.page || 1
        const limit = +req.query.limit || 2
        const skip = (page - 1) * limit
        queryCommand.skip(skip).limit(limit)

        const response = await queryCommand
        const count = await Product.find(formattedQueries).countDocuments()
        if (!response) return responseData(res, 404, 1, 'No product found')
        responseData(res, 200, 0, '', count, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getOneProduct = async (req, res) => {
    try {
        const { _id } = req.params
        if (!mongoose.Types.ObjectId.isValid(_id))
            return responseData(res, 400, 1, 'Invalid product id')
        const response = await Product.findById(
            new mongoose.Types.ObjectId(_id)
        )
        if (!response) return responseData(res, 404, 1, 'No product found')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createProduct = async (req, res) => {
    try {
        const { data } = req
        const category = await Category.findById(
            new mongoose.Types.ObjectId(data.category)
        )
        const brand = await Brand.findById(
            new mongoose.Types.ObjectId(data.brand)
        )
        if (!category) {
            return responseData(res, 404, 1, 'Category not found')
        }
        if (!brand) {
            return responseData(res, 404, 1, 'Brand not found')
        }

        data.slug = generateSlug(data.productName)
        data.category = new mongoose.Types.ObjectId(data.category)
        data.brand = new mongoose.Types.ObjectId(data.brand)

        const response = await Product.create(data)
        if (!response)
            return responseData(res, 400, 1, 'Product created failed')
        responseData(res, 201, 0, '', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const updateProduct = async (req, res) => {
    try {
        const {
            data,
            params: { _id },
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid product id')
        }
        const category = await Category.findById(
            new mongoose.Types.ObjectId(data.category)
        )
        const brand = await Brand.findById(
            new mongoose.Types.ObjectId(data.brand)
        )
        if (!category) {
            return responseData(res, 404, 1, 'Category not found')
        }
        if (!brand) {
            return responseData(res, 404, 1, 'Brand not found')
        }

        data.slug = generateSlug(data.productName)
        data.category = new mongoose.Types.ObjectId(data.category)
        data.brand = new mongoose.Types.ObjectId(data.brand)

        const response = await Product.findByIdAndUpdate(_id, data, {
            new: true,
        })
        if (!response) return responseData(res, 400, 1, 'No product updated')
        responseData(res, 201, 0, 'Update product successfully')
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const deleteProduct = async (req, res) => {
    try {
        const {
            params: { _id },
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }

        const response = await Product.findByIdAndDelete(_id)
        if (!response) return responseData(res, 400, 1, 'No product deleted')
        responseData(
            res,
            201,
            0,
            `Product with productName ${response.productName} deleted successfully`
        )
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const handleRating = async (req, res) => {
    try {
        const {
            data: { star, comment, pid },
            user: { _id },
        } = req
        const productRating = await Product.findById(pid)
        const response = productRating?.rating?.find(
            (item) => item.votedBy.toString() === _id
        )
        if (response) {
            await Product.updateOne(
                {
                    rating: {
                        $elemMatch: response,
                    },
                },
                {
                    $set: {
                        'rating.$.star': star,
                        'rating.$.comment': comment,
                    },
                },
                { new: true }
            )
        } else {
            await Product.findByIdAndUpdate(
                pid,
                {
                    $push: {
                        rating: {
                            star,
                            comment,
                            votedBy: _id,
                        },
                    },
                },
                { new: true }
            )
        }

        // Average rating
        const updatedProduct = await Product.findById(pid)
        const ratingCount = updatedProduct.rating.length
        const sumRating = updatedProduct.rating.reduce(
            (sum, el) => sum + +el.star,
            0
        )
        updatedProduct.totalRating =
            Math.round((sumRating * 10) / ratingCount) / 10
        await updatedProduct.save()

        responseData(res, 200, 0, '', null, updatedProduct)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    getAllProducts,
    getOneProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    handleRating,
}
