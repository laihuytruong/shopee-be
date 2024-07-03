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
const removeAccents = require('remove-accents')

const getAllProducts = async (req, res) => {
    try {
        const { page, pageSize } = req.query
        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
        const limit = parseInt(pageSize, 10)

        const pipeline = [
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brand',
                    foreignField: '_id',
                    as: 'brand',
                },
            },
            {
                $unwind: {
                    path: '$brand',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'categoryitems',
                    localField: 'categoryItem',
                    foreignField: '_id',
                    as: 'categoryItem',
                },
            },
            {
                $unwind: {
                    path: '$categoryItem',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryItem.category',
                    foreignField: '_id',
                    as: 'categoryLookup',
                },
            },
            {
                $addFields: {
                    'categoryItem.category': {
                        $arrayElemAt: ['$categoryLookup', 0],
                    },
                },
            },
            { $skip: skip ? skip : 0 },
            { $limit: limit ? +limit : 10 },
            {
                $project: {
                    categoryLookup: 0,
                },
            },
        ]

        const products = await Product.aggregate(pipeline)
        const totalProducts = await Product.countDocuments()
        if (!products) return responseData(res, 404, 1, 'No product found')
        responseData(
            res,
            200,
            0,
            '',
            '',
            products,
            page,
            pageSize,
            totalProducts
        )
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getOneProduct = async (req, res) => {
    try {
        const { productName } = req.params

        const pipeline = [
            {
                $match: {
                    productName,
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'brand',
                    foreignField: '_id',
                    as: 'brandLookup',
                },
            },
            {
                $unwind: {
                    path: '$brandLookup',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'categoryitems',
                    localField: 'categoryItem',
                    foreignField: '_id',
                    as: 'categoryItem',
                },
            },
            {
                $unwind: {
                    path: '$categoryItem',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryItem.category',
                    foreignField: '_id',
                    as: 'categoryLookup',
                },
            },
            {
                $addFields: {
                    'categoryItem.category': {
                        $arrayElemAt: ['$categoryLookup', 0],
                    },
                },
            },
        ]

        const response = await Product.aggregate(pipeline).exec()

        if (!response || response.length === 0) {
            return responseData(res, 404, 1, 'No product found')
        }

        responseData(res, 200, 0, '', null, response[0])
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
        const { page, pageSize, ...query } = req.query
        let searchQuery = query
        let categoryItems = await CategoryItem.find({ slug })
        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
        const limit = parseInt(pageSize, 10)

        if (categoryItems.length === 0 || !categoryItems) {
            const category = await Category.findOne({ slug })
            if (category) {
                categoryItems = await CategoryItem.find({
                    category: category._id,
                })
                if (categoryItems.length > 0) {
                    const categoryItemIds = categoryItems.map(
                        (item) => item._id
                    )
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
            searchQuery = {
                ...query,
                categoryItem: { $in: [categoryItems[0]._id] },
            }
        }

        const pipeline = [
            {
                $match: searchQuery,
            },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brand',
                    foreignField: '_id',
                    as: 'brand',
                },
            },
            {
                $unwind: {
                    path: '$brand',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'categoryitems',
                    localField: 'categoryItem',
                    foreignField: '_id',
                    as: 'categoryItem',
                },
            },
            {
                $unwind: {
                    path: '$categoryItem',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryItem.category',
                    foreignField: '_id',
                    as: 'categoryLookup',
                },
            },
            {
                $addFields: {
                    'categoryItem.category': {
                        $arrayElemAt: ['$categoryLookup', 0],
                    },
                },
            },
            { $skip: skip ? skip : 0 },
            { $limit: limit ? +limit : 10 },
            {
                $project: {
                    categoryLookup: 0,
                },
            },
        ]

        const countPipeline = [
            {
                $match: searchQuery,
            },
            {
                $count: 'total',
            },
        ]

        const products = await Product.aggregate(pipeline)
        const totalCountResult = await Product.aggregate(countPipeline)
        const totalProducts = totalCountResult[0]
            ? totalCountResult[0].total
            : 0
        if (!products) {
            return responseData(res, 404, 1, 'No product found')
        }
        responseData(
            res,
            200,
            0,
            '',
            '',
            products,
            page,
            pageSize,
            totalProducts
        )
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const updateQuantities = async (req, res) => {
    const { cart } = req.body

    try {
        for (const item of cart) {
            const product = await Product.findById(
                item.productDetail.product._id
            )
            if (!product) {
                return responseData(res, 404, 1, 'Product not found')
            }

            product.sold += item.quantity
            await product.save()
        }

        responseData(res, 200, 0, 'Product quantities updated successfully')
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const search = async (req, res) => {
    try {
        const { keyword, page, pageSize } = req.query
        const normalizedSearch = removeAccents(keyword).toLowerCase()
        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
        const limit = parseInt(pageSize, 10)

        const pipeline = [
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brand',
                    foreignField: '_id',
                    as: 'brand',
                },
            },
            {
                $unwind: {
                    path: '$brand',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'categoryitems',
                    localField: 'categoryItem',
                    foreignField: '_id',
                    as: 'categoryItem',
                },
            },
            {
                $unwind: {
                    path: '$categoryItem',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryItem.category',
                    foreignField: '_id',
                    as: 'categoryLookup',
                },
            },
            {
                $addFields: {
                    'categoryItem.category': {
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

        const products = await Product.aggregate(pipeline)
        const totalProducts = await Product.countDocuments()
        const categoryItems = await CategoryItem.find()
        const filteredProducts = products.filter((product) =>
            removeAccents(product.productName)
                .toLowerCase()
                .includes(normalizedSearch)
        )
        const filterCategoryItems = categoryItems.filter((categoryItem) =>
            removeAccents(categoryItem.categoryItemName)
                .toLowerCase()
                .includes(normalizedSearch)
        )

        responseData(
            res,
            200,
            0,
            '',
            '',
            filterCategoryItems.length > 0
                ? filterCategoryItems
                : filteredProducts,
            page,
            pageSize,
            totalProducts
        )
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
    updateQuantities,
    search,
}
