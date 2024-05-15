const User = require('../models/user')
const jwt = require('jsonwebtoken')
const {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
} = require('../utils/helpers')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

const register = async (req, res) => {
    try {
        const { data, dataModel } = req
        if (dataModel)
            return res.status(404).json({
                err: 1,
                msg: 'Email already exist',
            })
        const dataNewUser = {
            ...data,
            password: hashPassword(data.password),
        }
        const newUser = new User(dataNewUser)
        const response = await newUser.save()
        res.status(201).json({
            err: response ? 0 : 1,
            msg: response ? 'Register successfully' : 'Register failed',
        })
    } catch (error) {
        res.status(500).json({
            err: 1,
            msg: 'Internal server error',
        })
    }
}

const login = async (req, res) => {
    try {
        const { data, dataModel } = req
        if (!dataModel)
            return res.status(400).json({
                err: 1,
                msg: 'Email incorrect',
            })
        if (!comparePassword(data.password, dataModel.password))
            return res.status(400).json({
                err: 1,
                msg: 'Password incorrect',
            })
        const { password, role, ...userData } = dataModel.toObject()

        // Generate access token and refresh token
        const payload = { _id: dataModel._id, role }
        const accessToken = generateAccessToken(payload, '1d')
        const refreshToken = generateRefreshToken(dataModel._id)

        // Save refresh token to db
        await User.findByIdAndUpdate(
            dataModel._id,
            { refreshToken },
            { new: true }
        )

        // Save refresh token to cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        res.status(200).json({
            err: 0,
            msg: 'Login successfully',
            accessToken: `Bearer ${accessToken}`,
            userData,
        })
    } catch (error) {
        res.status(500).json({
            err: 1,
            msg: 'Internal server error',
        })
    }
}

const generateNewToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies

        // Check cookie and refreshToken
        if (!refreshToken) {
            return res.status(401).json({
                err: 1,
                msg: 'Unauthorized',
            })
        }

        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decode) => {
                if (err) {
                    return res.status(401).json({
                        err: 1,
                        msg: err.message,
                    })
                }

                // Find user contain decode._id and cookie.refreshToken
                const user = await User.findOne({
                    _id: decode._id,
                    refreshToken,
                })

                if (!user) {
                    return res.status(401).json({
                        err: 1,
                        msg: 'Unauthorized. Please login again!',
                    })
                }

                // Create new access token
                const newToken = generateAccessToken(
                    { _id: user._id, role: user.role },
                    '2d'
                )

                return res.status(201).json({
                    err: 0,
                    newToken: `Bearer ${newToken}`,
                })
            }
        )
    } catch (error) {
        res.status(500).json({
            err: 1,
            msg: 'Internal server error',
        })
    }
}

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies

        // Check exist refreshToken
        if (!refreshToken) {
            return res.status(401).json({
                err: 1,
                msg: 'Not log in',
            })
        }

        // Delete refresh token on db
        await User.findOneAndUpdate(
            {
                refreshToken: cookie.refreshToken,
            },
            { refreshToken: '' },
            { new: true }
        )

        // Delete refresh token on cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
        })
        return res.status(200).json({
            err: 0,
            msg: 'Logout successfully',
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            err: 1,
            msg: 'Internal server error',
        })
    }
}

const fortgotPassword = async (req, res) => {
    try {
        const { email } = req.query
        if (!email)
            return res.status(400).json({
                err: 1,
                msg: 'Email invalid',
            })
        const user = await User.findOne({ email })
        if (!user)
            return res.status(404).json({
                err: 1,
                msg: 'User not found',
            })
        const resetToken = user.createPasswordChangeToken()
        await user.save()

        const html = `Please click on the link below to change your password. This link will expire after 15 minutes 
                    <a href=${process.env.URL_SERVER}/api/user/reset-password/${resetToken}>Click here</a>`
        const data = {
            email,
            html,
        }
        const response = await sendEmail(data)
        if (!response)
            return res.status(400).json({
                err: 0,
                msg: 'Send email failed',
            })
        res.status(200).json({
            err: 0,
            response,
        })
    } catch (error) {
        res.status(500).json({
            err: 1,
            msg: 'Internal server error',
        })
    }
}

const resetPassword = async (req, res) => {
    try {
        const { password, token } = req.body
        if (!password || !token)
            return res.status(400).json({
                err: 1,
                msg: 'Password or token invalid',
            })
        const passwordResetToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')
        const user = await User.findOne({
            passwordResetToken,
            passwordResetExpires: { $gt: Date.now() },
        })
        if (!user)
            return res.status(400).json({
                err: 1,
                msg: 'Invalid reset token',
            })
        user.password = hashPassword(password)
        user.passwordResetToken = undefined
        user.passwordChangeAt = Date.now()
        user.passwordResetExpires = undefined
        await user.save()
        res.status(201).json({
            err: 0,
            msg: 'Reset password succesfully',
        })
    } catch (error) {
        res.status(500).json({
            err: 1,
            msg: 'Internal server error',
        })
    }
}

module.exports = {
    register,
    login,
    generateNewToken,
    logout,
    fortgotPassword,
    resetPassword,
}
