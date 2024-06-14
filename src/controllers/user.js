const User = require('../models/user')
const Role = require('../models/role')
const Product = require('../models/product')
const mongoose = require('mongoose')
const moment = require('moment')
const {
    getFileNameCloudinary,
    responseData,
    hashPassword,
    comparePassword,
} = require('../utils/helpers')
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
        const response = await User.findById(userId)
            .select('-refreshToken -password -role')
            .populate('cart')
            .populate('cart.product', '-createdAt -updatedAt -__v')
        if (!response) {
            return responseData(res, 401, 1, 'Unauthorized. Please login')
        }
        responseData(res, 200, 0, '', null, response)
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

        const product = await Product.findById(data.pid)
        if (!product) return responseData(res, 404, 1, 'Product not found')

        const user = await User.findById(_id).select('cart')

        const findProduct = user?.cart.find(
            (el) =>
                el.product.toString() === data.pid && el.color === data.color
        )

        if (findProduct) {
            await User.updateOne(
                {
                    cart: { $elemMatch: findProduct },
                },
                {
                    $set: {
                        'cart.$.quantity':
                            findProduct.quantity + +data.quantity,
                    },
                },
                { new: true }
            )
            return responseData(res, 200, 0, 'Add product to cart successfully')
        } else {
            await User.findByIdAndUpdate(
                _id,
                {
                    $push: {
                        cart: {
                            product: data.pid,
                            quantity: +data.quantity,
                            color: data.color,
                        },
                    },
                },
                { new: true }
            )
            return responseData(res, 200, 0, 'Add product to cart successfully')
        }
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
