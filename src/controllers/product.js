const mongoose = require('mongoose')
const Product = require('../models/product')
const Category = require('../models/category')
const CategoryItem = require('../models/categoryItem')
const Brand = require('../models/brand')
const {
    generateSlug,
    responseData,
    paginationSortSearch,
} = require('../utils/helpers')

const getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, ...query } = req.query
        const { response, count } = await paginationSortSearch(
            Product,
            query,
            page,
            limit
        )
        const result = {
            page: +page,
            pageSize: +limit,
            totalPage: Math.ceil(count / +limit),
            data: response,
        }
        if (!response) return responseData(res, 404, 1, 'No product found')
        responseData(res, 200, 0, '', count, result)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getOneProduct = async (req, res) => {
    try {
        const { productName } = req.params
        const response = await Product.findOne({
            productName,
        })
            .populate('brand', 'brandName thumbnail')
            .populate('categoryItem')
        if (!response) return responseData(res, 404, 1, 'No product found')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createProduct = async (req, res) => {
    try {
        const { data } = req
        console.log(data)
        const categoryItem = await CategoryItem.findById(
            new mongoose.Types.ObjectId(data.categoryItem)
        )
        const brand = await Brand.findById(
            new mongoose.Types.ObjectId(data.brand)
        )
        if (!categoryItem) {
            return responseData(res, 404, 1, 'Category item not found')
        }
        if (!brand) {
            return responseData(res, 404, 1, 'Brand not found')
        }
        const response = await Product.create({
            ...data,
            slug: generateSlug(data.productName),
            categoryItem: categoryItem._id,
            brand: new mongoose.Types.ObjectId(data.brand),
        })
        console.log(1)
        console.log(response)
        if (!response)
            return responseData(res, 400, 1, 'Product created failed')
        responseData(res, 201, 0, '', null, response)
    } catch (error) {
        console.log(error)
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
        const categoryItem = await CategoryItem.findById(
            new mongoose.Types.ObjectId(data.categoryItem)
        )
        const brand = await Brand.findById(
            new mongoose.Types.ObjectId(data.brand)
        )
        if (!categoryItem) {
            return responseData(res, 404, 1, 'Category item not found')
        }
        if (!brand) {
            return responseData(res, 404, 1, 'Brand not found')
        }

        const response = await Product.findByIdAndUpdate(
            _id,
            {
                ...data,
                slug: generateSlug(data.productName),
                categoryItem: new mongoose.Types.ObjectId(data.categoryItem),
                brand: new mongoose.Types.ObjectId(data.brand),
            },
            {
                new: true,
            }
        )
        console.log(response)
        if (!response) return responseData(res, 400, 1, 'No product updated')
        responseData(res, 200, 0, 'Update product successfully')
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

const uploadImagesProduct = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        if (!req.files) return responseData(res, 400, 1, 'No image upload')
        const response = await Product.findByIdAndUpdate(
            _id,
            {
                $push: {
                    image: { $each: req.files.map((image) => image.path) },
                },
            },
            { new: true }
        )
        console.log(response)
        if (!response) return responseData(res, 400, 1, 'Upload image failed')
        responseData(res, 200, 1, 'Upload image successfully', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getProductsByCategory = async (req, res) => {
    try {
        const { slug } = req.params
        const { page = 1, limit = 10, ...query } = req.query
        let searchQuery = query
        let categoryItems = await CategoryItem.find({ slug })
        if (categoryItems.length === 0 || !categoryItems) {
            const category = await Category.findOne({ slug })
            if (category) {
                categoryItems = await CategoryItem.find({
                    category: category._id,
                })
                if (categoryItems.length > 0) {
                    const categoryItemIds = categoryItems.map((item) => {
                        return item._id
                    })
                    searchQuery = {
                        ...query,
                        categoryItem: { $in: categoryItemIds },
                    }
                } else {
                    return responseData(res, 404, 1, 'No product found')
                }
            } else {
                return responseData(res, 404, 1, 'No category')
            }
        } else {
            // If categoryItems found, search products within that categoryItem
            searchQuery = { ...query, categoryItem: categoryItems[0]._id }
        }

        const { response, count } = await paginationSortSearch(
            Product,
            searchQuery,
            page,
            limit,
            req.query.sort
        )
        const result = {
            page: +page,
            pageSize: +limit,
            totalPage: Math.ceil(count / +limit),
            data: response,
        }
        if (!response) {
            return responseData(res, 404, 1, 'No product found')
        }
        responseData(res, 200, 0, '', count, result)
    } catch (error) {
        console.log(error)
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
    uploadImagesProduct,
    getProductsByCategory,
}
