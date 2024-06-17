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
        const response = await User.find().select(
            '-refreshToken -password -role'
        )
        if (!response || response.length == 0)
            return responseData(res, 404, 1, 'No user found')
        responseData(res, 200, 0, '', response.length, response)
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

        const userId = new mongoose.Types.ObjectId(_id)
        const pipeline = [
            {
                $match: {
                    _id: userId,
                },
            },
            {
                $unwind: '$cart',
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
                $unwind: '$cart.productDetail',
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
                $unwind: '$cart.productDetail.product',
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
                    as: 'cart.variationOption.variation',
                },
            },
            {
                $unwind: {
                    path: '$cart.variationOption.variation',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: {
                    updatedAt: -1,
                },
            },
            {
                $group: {
                    _id: '$_id',
                    user: { $first: '$$ROOT' },
                    cart: { $push: '$cart' },
                },
            },
            {
                $addFields: {
                    cart: { $reverseArray: '$cart' },
                },
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ['$user', { cart: '$cart' }],
                    },
                },
            },
            {
                $project: {
                    'user.cart': 0,
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
        console.log('_id: ', _id)
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
            params: { _id },
            data: { role, isBlocked },
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id))
            return responseData(res, 400, 1, 'Invalid ID')

        const newRole = new mongoose.Types.ObjectId(role)
        const roleData = await Role.findById(newRole)
        if (!roleData) return responseData(res, 404, 1, 'Role does not exist')
        const response = await User.findByIdAndUpdate(
            _id,
            {
                role: newRole,
                isBlocked: JSON.parse(isBlocked),
            },
            {
                new: true,
            }
        )
            .select('-refreshToken -password')
            .populate('role', 'roleName')
        if (!response) return responseData(res, 400, 1, 'Update user failed')
        responseData(res, 200, 0, '', null, response)
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
        const { data } = req

        const productDetail = await ProductDetail.findById(data.pdId)
        if (!productDetail)
            return responseData(res, 404, 1, 'Product detail not found')

        const user = await User.findById(_id).select('cart')

        const findProduct = user?.cart.find(
            (el) =>
                el.productDetail.toString() === data.pdId &&
                el.variationOption.toString() === data.variationOption
        )

        if (findProduct) {
            await User.updateOne(
                {
                    _id,
                    'cart.productDetail': data.pdId,
                    'cart.variationOption': data.variationOption,
                },
                {
                    $inc: {
                        'cart.$.quantity': +data.quantity,
                    },
                }
            )
        } else {
            await User.findByIdAndUpdate(_id, {
                $push: {
                    cart: {
                        productDetail: data.pdId,
                        quantity: +data.quantity,
                        variationOption: data.variationOption,
                    },
                },
            })
        }

        const updatedUser = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(_id),
                },
            },
            {
                $unwind: '$cart',
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
                $unwind: '$cart.productDetail',
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
                $unwind: '$cart.variationOption',
            },
            {
                $group: {
                    _id: '$_id',
                    cart: { $push: '$cart' },
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
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    getAllUsers,
    getCurrentUser,
    updateUser,
    updateUserByAdmin,
    deleteUser,
    updateCart,
    uploadAvatar,
    changePassword,
}
