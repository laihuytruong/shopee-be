const User = require('../models/user')
const Role = require('../models/role')
const mongoose = require('mongoose')
const {
    responseData,
    hashPassword,
    comparePassword,
} = require('../utils/helpers')
const ProductDetail = require('../models/productDetail')
const cloudinary = require('cloudinary').v2

const getAllUsers = async (req, res) => {
    try {
        const { page, pageSize } = req.query
        const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
        const limit = parseInt(pageSize, 10)
        const pipeline = [
            {
                $match: {
                    role: {
                        $in: [
                            new mongoose.Types.ObjectId(
                                '6646091905062f8ea9e1e7a8'
                            ),
                            new mongoose.Types.ObjectId(
                                '66460a4ce2500c3ce453d161'
                            ),
                        ],
                    },
                },
            },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'role',
                    foreignField: '_id',
                    as: 'roleLookup',
                },
            },
            {
                $addFields: {
                    role: {
                        $arrayElemAt: ['$roleLookup', 0],
                    },
                },
            },
            { $skip: skip ? skip : 0 },
            { $limit: limit ? +limit : 10 },
            {
                $project: {
                    roleLookup: 0,
                },
            },
        ]
        const response = await User.aggregate(pipeline)
        const totalUsers = await User.countDocuments()
        if (!response || response.length == 0)
            return responseData(res, 404, 1, 'No user found')
        responseData(res, 200, 0, '', '', response, page, pageSize, totalUsers)
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const getCurrentUser = async (req, res) => {
    try {
        const { _id } = req.user

        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid user ID')
        }

        const pipeline = [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(_id),
                },
            },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'role',
                    foreignField: '_id',
                    as: 'roleInfo',
                },
            },
            {
                $unwind: {
                    path: '$roleInfo',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $facet: {
                    userInfo: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                email: 1,
                                username: 1,
                                dateOfBirth: 1,
                                address: 1,
                                phoneNumber: 1,
                                sex: 1,
                                avatar: 1,
                                role: '$roleInfo',
                            },
                        },
                    ],
                    cart: [
                        {
                            $addFields: {
                                cart: { $ifNull: ['$cart', []] },
                            },
                        },
                        {
                            $unwind: {
                                path: '$cart',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: 'productdetails',
                                localField: 'cart.productDetail',
                                foreignField: '_id',
                                as: 'cart.productDetail',
                            },
                        },
                        {
                            $unwind: {
                                path: '$cart.productDetail',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'cart.productDetail.product',
                                foreignField: '_id',
                                as: 'cart.productDetail.product',
                            },
                        },
                        {
                            $unwind: {
                                path: '$cart.productDetail.product',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: 'brands',
                                localField: 'cart.productDetail.product.brand',
                                foreignField: '_id',
                                as: 'cart.productDetail.product.brand',
                            },
                        },
                        {
                            $unwind: {
                                path: '$cart.productDetail.product.brand',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: 'categoryitems',
                                localField:
                                    'cart.productDetail.product.categoryItem',
                                foreignField: '_id',
                                as: 'cart.productDetail.product.categoryItem',
                            },
                        },
                        {
                            $unwind: {
                                path: '$cart.productDetail.product.categoryItem',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: 'categories',
                                localField:
                                    'cart.productDetail.product.categoryItem.category',
                                foreignField: '_id',
                                as: 'cart.productDetail.product.categoryItem.category',
                            },
                        },
                        {
                            $unwind: {
                                path: '$cart.productDetail.product.categoryItem.category',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: 'variationoptions',
                                localField: 'cart.variationOption',
                                foreignField: '_id',
                                as: 'cart.variationOption',
                            },
                        },
                        {
                            $unwind: {
                                path: '$cart.variationOption',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: 'variations',
                                localField: 'cart.variationOption.variationId',
                                foreignField: '_id',
                                as: 'cart.variationOption.variationId',
                            },
                        },
                        {
                            $unwind: {
                                path: '$cart.variationOption.variationId',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $group: {
                                _id: '$cart._id',
                                productDetail: {
                                    $first: '$cart.productDetail',
                                },
                                quantity: { $first: '$cart.quantity' },
                                variationOption: {
                                    $push: {
                                        $cond: {
                                            if: {
                                                $ne: [
                                                    '$cart.variationOption',
                                                    {},
                                                ],
                                            },
                                            then: '$cart.variationOption',
                                            else: [],
                                        },
                                    },
                                },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                cart: {
                                    $push: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    {
                                                        $ne: [
                                                            '$productDetail',
                                                            {},
                                                        ],
                                                    },
                                                    {
                                                        $ne: [
                                                            '$quantity',
                                                            null,
                                                        ],
                                                    },
                                                    {
                                                        $ne: [
                                                            '$variationOption',
                                                            [],
                                                        ],
                                                    },
                                                ],
                                            },
                                            then: '$$ROOT',
                                            else: null,
                                        },
                                    },
                                },
                            },
                        },
                        {
                            $addFields: {
                                cart: {
                                    $filter: {
                                        input: '$cart',
                                        as: 'item',
                                        cond: { $ne: ['$$item', null] },
                                    },
                                },
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    userInfo: { $arrayElemAt: ['$userInfo', 0] },
                    cart: { $arrayElemAt: ['$cart.cart', 0] },
                },
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ['$userInfo', { cart: '$cart' }],
                    },
                },
            },
        ]

        const response = await User.aggregate(pipeline)
        if (!response || response.length === 0) {
            return responseData(res, 401, 1, 'Unauthorized. Please login')
        }

        responseData(res, 200, 0, '', null, response[0])
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const updateUser = async (req, res) => {
    try {
        const {
            params: { _id },
            data,
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        const { oldPassword, newPassword, confirmPassword, ...rest } = data
        const response = await User.findByIdAndUpdate(
            new mongoose.Types.ObjectId(_id),
            {
                ...rest,
            },
            {
                new: true,
            }
        ).select('-refreshToken -password -role')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const changePassword = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        const { oldPassword, newPassword, confirmPassword } = req.body
        const user = await User.findById(_id)
        if (!comparePassword(oldPassword, user.password)) {
            return responseData(res, 400, 1, 'Mật khẩu cũ không chính xác')
        }
        if (newPassword !== confirmPassword) {
            return responseData(res, 400, 1, 'Mật khẩu mới không trùng khớp')
        }
        if (newPassword === oldPassword) {
            return responseData(
                res,
                400,
                1,
                'Mật khẩu mới phải khác mật khẩu cũ'
            )
        }
        const response = await User.findByIdAndUpdate(
            _id,
            {
                password: hashPassword(newPassword),
            },
            {
                new: true,
            }
        ).select('-refreshToken -password -role')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const updateUserByAdmin = async (req, res) => {
    try {
        const {
            body: { ids, role, isBlocked },
        } = req
        if (!Array.isArray(ids) || ids.length === 0) {
            return responseData(res, 400, 1, 'Invalid IDs array')
        }

        if (!role || !mongoose.Types.ObjectId.isValid(role)) {
            return responseData(res, 400, 1, 'Invalid role ID')
        }

        const roleData = await Role.findById(role)
        if (!roleData) {
            return responseData(res, 404, 1, 'Role does not exist')
        }

        const response = await User.updateMany(
            {
                _id: {
                    $in: ids.map((id) => new mongoose.Types.ObjectId(id)),
                },
            },
            {
                role: roleData._id,
                isBlocked: JSON.parse(isBlocked),
            },
            { new: true }
        )
            .select('-refreshToken -password')
            .populate('role', 'roleName')

        if (response.nModified === 0) {
            return responseData(res, 400, 1, 'No users updated')
        }

        responseData(res, 200, 0, 'Users updated successfully')
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const deleteUser = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id))
            return responseData(res, 400, 1, 'Invalid ID')

        const response = await User.findByIdAndDelete(_id)
        if (!response) return responseData(res, 400, 1, 'No user deleted')
        responseData(res, 200, 0, `User with email ${response.email} deleted`)
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const uploadAvatar = async (req, res) => {
    try {
        const { _id } = req.user
        const file = req.file
        if (!_id || !mongoose.Types.ObjectId.isValid(_id))
            return responseData(res, 400, 1, 'Invalid ID')
        if (!file) return responseData(res, 400, 1, 'No image uploaded')
        const response = await User.findByIdAndUpdate(
            _id,
            { avatar: file?.path },
            { new: true }
        ).select('-refreshToken -password -role')
        if (!response && file) {
            cloudinary.uploader.destroy(file.filename)
            return responseData(res, 400, 1, 'Upload avatar failed')
        }
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
        if (req.file) cloudinary.uploader.destroy(req.file.filename)
    }
}

const updateCart = async (req, res) => {
    try {
        const { _id } = req.user
        const { pdId, variationOption, quantity } = req.body

        const productDetailId = new mongoose.Types.ObjectId(pdId)
        const variationOptionIds = variationOption.map(
            (id) => new mongoose.Types.ObjectId(id)
        )

        const productDetail = await ProductDetail.findById(productDetailId)
        if (!productDetail)
            return responseData(res, 404, 1, 'Product detail not found')

        const user = await User.findById(_id).select('cart')

        const findProduct = user?.cart.find(
            (el) =>
                el.productDetail.toString() === productDetailId.toString() &&
                Array.isArray(el.variationOption) &&
                el.variationOption.length === variationOptionIds.length &&
                el.variationOption.every(
                    (val, index) =>
                        val.toString() === variationOptionIds[index].toString()
                )
        )

        if (findProduct) {
            await User.updateOne(
                {
                    _id,
                    'cart.productDetail': productDetailId,
                    'cart.variationOption': variationOptionIds,
                },
                {
                    $inc: {
                        'cart.$.quantity': +quantity,
                    },
                }
            )
        } else {
            await User.findByIdAndUpdate(_id, {
                $push: {
                    cart: {
                        productDetail: productDetailId,
                        quantity: +quantity,
                        variationOption: variationOptionIds,
                    },
                },
            })
        }

        const updatedUser = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(_id) } },
            { $unwind: '$cart' },
            {
                $lookup: {
                    from: 'productdetails',
                    localField: 'cart.productDetail',
                    foreignField: '_id',
                    as: 'cart.productDetail',
                },
            },
            { $unwind: '$cart.productDetail' },
            { $unwind: '$cart.variationOption' },
            {
                $lookup: {
                    from: 'variationoptions',
                    localField: 'cart.variationOption',
                    foreignField: '_id',
                    as: 'variationOptionDetail',
                },
            },
            {
                $unwind: {
                    path: '$variationOptionDetail',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: {
                        cartId: '$cart._id',
                        userId: '$_id',
                    },
                    productDetail: { $first: '$cart.productDetail' },
                    quantity: { $first: '$cart.quantity' },
                    variationOptions: { $push: '$variationOptionDetail' },
                },
            },
            {
                $group: {
                    _id: '$_id.userId',
                    cart: {
                        $push: {
                            _id: '$_id.cartId',
                            productDetail: '$productDetail',
                            quantity: '$quantity',
                            variationOption: '$variationOptions',
                        },
                    },
                },
            },
        ])

        return responseData(
            res,
            200,
            0,
            'Add product to cart successfully',
            null,
            updatedUser[0]
        )
    } catch (error) {
        console.log('error: ', error)
        return responseData(res, 500, 1, error.message)
    }
}

const deleteItemCart = async (req, res) => {
    try {
        const { _id } = req.user
        const { pdId, variationOption } = req.body
        const user = await User.findById(_id).select('cart')
        if (!user) return responseData(res, 404, 1, 'User not found')

        const findProduct = user.cart.find(
            (el) =>
                el.productDetail.toString() === pdId &&
                variationOption.every((opt) =>
                    el.variationOption.some(
                        (v) => v.toString() === opt._id.toString()
                    )
                )
        )
        if (!findProduct) return responseData(res, 404, 1, 'Cart empty')

        await User.updateOne(
            { _id },
            {
                $pull: {
                    cart: {
                        productDetail: new mongoose.Types.ObjectId(pdId),
                        variationOption: {
                            $all: variationOption.map(
                                (opt) => new mongoose.Types.ObjectId(opt._id)
                            ),
                        },
                    },
                },
            },
            { new: true }
        )

        responseData(res, 200, 0, 'Delete product cart successfully')
    } catch (error) {
        console.log('error: ', error)
        responseData(res, 500, 1, error.message)
    }
}

const deleteAllItemCart = async (req, res) => {
    try {
        const { _id } = req.user
        const { items, checkAll } = req.body

        if (!checkAll && items && items.length > 0) {
            for (const item of items) {
                await User.updateOne(
                    { _id },
                    {
                        $pull: {
                            cart: {
                                productDetail: new mongoose.Types.ObjectId(
                                    item.pdId
                                ),
                                variationOption: {
                                    $all: item.variationOption.map(
                                        (opt) =>
                                            new mongoose.Types.ObjectId(opt)
                                    ),
                                },
                            },
                        },
                    }
                )
            }
        } else {
            await User.updateOne(
                { _id },
                {
                    $set: {
                        cart: [],
                    },
                }
            )
        }

        const updatedUser = await User.findById(_id).select('cart')

        return responseData(
            res,
            200,
            0,
            'Cart cleared successfully',
            null,
            updatedUser
        )
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    getAllUsers,
    getCurrentUser,
    updateUser,
    updateUserByAdmin,
    deleteUser,
    uploadAvatar,
    changePassword,
    updateCart,
    deleteItemCart,
    deleteAllItemCart,
}
