const User = require('../models/user')
const Role = require('../models/role')
const mongoose = require('mongoose')
const moment = require('moment')
const { getFileNameCloudinary } = require('../utils/helpers')
const cloudinary = require('cloudinary').v2

const getAllUsers = async (req, res) => {
    try {
        const response = await User.find().select(
            '-refreshToken -password -role'
        )
        if (!response || response.length == 0)
            return res.status(404).json({
                err: 1,
                msg: 'No users found',
            })
        res.status(200).json({
            err: 0,
            users: {
                count: response.length,
                data: response,
            },
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            err: 1,
            msg: error.message,
        })
    }
}

const getCurrentUser = async (req, res) => {
    try {
        const { _id } = req.user
        const user = await User.findById(_id).select(
            '-refreshToken -password -role'
        )
        if (!user) {
            return res.status(401).json({
                err: 1,
                msg: 'Unauthorized. Please login',
            })
        }
        res.status(200).json({
            err: 0,
            user,
        })
    } catch (error) {
        res.status(500).json({
            err: 1,
            msg: error.message,
        })
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
            return res.status(400).json({
                err: 1,
                msg: 'Invalid ID',
            })
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
        res.status(response ? 200 : 400).json({
            err: response ? 0 : 1,
            response: response ? response : 'Update user failed',
        })
        if (!response && fileData)
            cloudinary.uploader.destroy(fileData.filename)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            err: 1,
            msg: error.message,
        })
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
            return res.status(400).json({
                err: 1,
                msg: 'Invalid ID',
            })

        const newRole = new mongoose.Types.ObjectId(role)
        const roleData = await Role.findById(newRole)
        if (!roleData)
            return res.status(404).json({
                err: 1,
                response: `Role doesn't exist`,
            })
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
        return res.status(response ? 200 : 400).json({
            err: response ? 0 : 1,
            response: response ? response : 'Update user failed',
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            err: 1,
            msg: error.message,
        })
    }
}

const deleteUser = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id))
            return res.status(400).json({
                err: 1,
                msg: 'Invalid ID',
            })
        const response = await User.findByIdAndDelete(_id)
        res.status(response ? 200 : 400).json({
            err: response ? 0 : 1,
            response: response
                ? `User with email ${response.email} deleted`
                : 'No user deleted',
        })
        if (
            response &&
            response.avatar.startWith('https://res.cloudinary.com')
        ) {
            const filename = getFileNameCloudinary(response.avatar)
            cloudinary.uploader.destroy(filename)
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            err: 1,
            msg: error.message,
        })
    }
}

module.exports = {
    getAllUsers,
    getCurrentUser,
    updateUser,
    updateUserByAdmin,
    deleteUser,
}
