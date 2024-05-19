const User = require('../models/user')
const Role = require('../models/role')
const mongoose = require('mongoose')
const moment = require('moment')
const { getFileNameCloudinary, responseData } = require('../utils/helpers')
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
        const response = await User.findById(_id).select(
            '-refreshToken -password -role'
        )
        if (!response)
            return responseData(res, 401, 1, 'Unauthorized. Please login')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const updateUser = async (req, res) => {
    const fileData = req.file
    try {
        const {
            params: { _id },
            data,
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            if (fileData) cloudinary.uploader.destroy(fileData.filename)
            return responseData(res, 400, 1, 'Invalid ID')
        }
        const response = await User.findByIdAndUpdate(
            _id,
            {
                ...data,
                address:
                    data.address && data.address?.length > 0
                        ? data.address
                        : [],
                dateOfBirth: moment(data.dateOfBirth, 'DD/MM/YYYY').toDate(),
                avatar: fileData.path,
            },
            {
                new: true,
            }
        ).select('-refreshToken -password -role')

        if (!response) return responseData(res, 400, 1, 'Update user failed')
        responseData(res, 200, 0, '', null, response)

        if (!response && fileData)
            cloudinary.uploader.destroy(fileData.filename)
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
        if (fileData) cloudinary.uploader.destroy(fileData.filename)
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
        if (
            response &&
            response.avatar.startWith('https://res.cloudinary.com')
        ) {
            const filename = getFileNameCloudinary(response.avatar)
            cloudinary.uploader.destroy(filename)
        }
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    getAllUsers,
    getCurrentUser,
    updateUser,
    updateUserByAdmin,
    deleteUser,
}
