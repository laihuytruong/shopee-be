const User = require('../models/user')

const getAllUsers = async (req, res) => {
    try {
        const response = await User.find()
        if (!response || response.length == 0)
            return res.status(404).json({
                err: 1,
                msg: 'No users found',
            })
        res.status(200).json({
            err: 0,
            response: {
                count: response.length,
                data: response,
            },
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            err: 1,
            msg: 'Internal server error',
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
            msg: 'Internal server error',
        })
    }
}

module.exports = { getAllUsers, getCurrentUser }
