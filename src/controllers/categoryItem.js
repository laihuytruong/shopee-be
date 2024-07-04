const mongoose = require('mongoose')
const CategoryItem = require('../models/categoryItem')
const Category = require('../models/category')
const { responseData, generateSlug } = require('../utils/helpers')

const getAllCategoryItems = async (req, res) => {
    try {
        const response = await CategoryItem.find().populate('category')
        if (!response)
            return responseData(res, 404, 1, 'No category item found')
        responseData(res, 200, 0, '', response.length, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getCategoryItem = async (req, res) => {
    try {
        const { _id } = req.params
        if (!mongoose.Types.ObjectId.isValid(_id))
            return responseData(res, 400, 1, 'Invalid category item id')
        const response = await CategoryItem.findById(
            new mongoose.Types.ObjectId(_id)
        ).populate('category')
        if (!response)
            return responseData(res, 404, 1, 'No category item found')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getItemBySlug = async (req, res) => {
    try {
        const { slug } = req.params

        const pipeline = [
            {
                $facet: {
                    matchedSlug: [
                        {
                            $match: {
                                slug,
                            },
                        },
                        {
                            $lookup: {
                                from: 'categories',
                                localField: 'category',
                                foreignField: '_id',
                                as: 'category',
                            },
                        },
                        {
                            $unwind: {
                                path: '$category',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                    matchedCategory: [
                        {
                            $lookup: {
                                from: 'categories',
                                localField: 'category',
                                foreignField: '_id',
                                as: 'category',
                            },
                        },
                        {
                            $unwind: {
                                path: '$category',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $match: {
                                'category.slug': slug,
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    items: {
                        $concatArrays: ['$matchedSlug', '$matchedCategory'],
                    },
                },
            },
            {
                $unwind: {
                    path: '$items',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $replaceRoot: {
                    newRoot: '$items',
                },
            },
        ]

        const response = await CategoryItem.aggregate(pipeline)

        if (!response || response.length === 0)
            return responseData(res, 404, 1, 'No category item found')

        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const createCategoryItem = async (req, res) => {
    try {
        const {
            dataModel,
            data: { categoryItemName, category },
        } = req
        if (dataModel) {
            return responseData(res, 400, 1, 'Category already exist')
        }
        const categoryData = await Category.findById(
            new mongoose.Types.ObjectId(category)
        )
        if (!categoryData)
            return responseData(res, 400, 1, 'Category does not exist')
        const response = await CategoryItem.create({
            categoryItemName,
            slug: generateSlug(categoryItemName),
            category,
        })
        console.log(response)
        if (!response) {
            return responseData(res, 400, 1, 'Create category item failed')
        }
        responseData(
            res,
            201,
            0,
            'Create category item successfully',
            null,
            response
        )
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const updateCategoryItem = async (req, res) => {
    try {
        const {
            params: { _id },
            data: { categoryItemName, category },
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        const categoryData = await Category.findById(
            new mongoose.Types.ObjectId(category)
        )
        if (!categoryData)
            return responseData(res, 400, 1, 'Category does not exist')
        const response = await CategoryItem.findByIdAndUpdate(
            _id,
            {
                categoryItemName,
                slug: generateSlug(categoryItemName),
                category,
            },
            {
                new: true,
            }
        )
        if (!response) {
            return responseData(res, 400, 1, 'No category updated')
        }
        responseData(res, 200, 0, 'Updated category successfully')
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const deleteCategoryItem = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id))
            return responseData(res, 400, 1, 'Invalid ID')
        const response = await CategoryItem.findByIdAndDelete(_id)
        if (!response)
            return responseData(res, 400, 1, 'No category item deleted')

        responseData(res, 200, 0, `Category item deleted`)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    getAllCategoryItems,
    getCategoryItem,
    createCategoryItem,
    updateCategoryItem,
    deleteCategoryItem,
    getItemBySlug,
}
