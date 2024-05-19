const User = require('../models/user')
const jwt = require('jsonwebtoken')
const {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    responseData,
} = require('../utils/helpers')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

const register = async (req, res) => {
    try {
        const { data, dataModel } = req
        if (dataModel) return responseData(res, 400, 1, 'Email already exist')
        const dataNewUser = {
            ...data,
            password: hashPassword(data.password),
        }
        const response = await User.create(dataNewUser)
        if (!response) return responseData(res, 400, 1, 'Register failed')
        responseData(res, 201, 0, 'Register successfully', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const login = async (req, res) => {
    try {
        const { data, dataModel } = req
        if (!dataModel) return responseData(res, 400, 1, 'Email incorrect')

        if (!comparePassword(data.password, dataModel.password))
            return responseData(res, 400, 1, 'Password incorrect')
        const user = await User.findById(dataModel._id).populate(
            'role',
            'roleName'
        )
        const {
            password,
            isBlocked,
            passwordChangeAt,
            refreshToken,
            ...response
        } = user.toObject()
        const role = response.role
        // Generate access token and refresh token
        const payload = { _id: user._id, role }
        const accessToken = generateAccessToken(payload, '2d')
        const newRefreshToken = generateRefreshToken(user._id)
        // Save refresh token to db
        await User.findByIdAndUpdate(
            user._id,
            { refreshToken: newRefreshToken },
            { new: true }
        )

        // Save refresh token to cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        responseData(
            res,
            200,
            0,
            'Login successfully',
            null,
            response,
            `Bearer ${accessToken}`
        )
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const generateNewToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies

        // Check cookie and refreshToken
        if (!refreshToken) {
            return responseData(res, 401, 1, 'Unauthorized')
        }

        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decode) => {
                if (err) {
                    return responseData(res, 401, 1, err.message)
                }

                // Find user contain decode._id and cookie.refreshToken
                const user = await User.findOne({
                    _id: decode._id,
                    refreshToken,
                })
                if (!user) {
                    return responseData(
                        res,
                        401,
                        1,
                        'Unauthorized. Please login again!'
                    )
                }

                // Create new access token
                const newToken = generateAccessToken(
                    { _id: user._id, role: user.role },
                    '2d'
                )

                responseData(res, 201, 0, '', null, null, `Bearer ${newToken}`)
            }
        )
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies

        // Check exist refreshToken
        if (!refreshToken) {
            return responseData(res, 401, 1, 'Not log in')
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
        responseData(res, 200, 0, 'Logout successfully')
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const fortgotPassword = async (req, res) => {
    try {
        const { email } = req.query
        if (!email) return responseData(res, 400, 1, 'Email invalid')
        const user = await User.findOne({ email })
        if (!user) return responseData(res, 404, 1, 'User not found')
        const resetToken = user.createPasswordChangeToken()
        await user.save()

        const html = `Please click on the link below to change your password. This link will expire after 15 minutes 
                    <a href=${process.env.URL_SERVER}/api/user/reset-password/${resetToken}>Click here</a>`
        const data = {
            email,
            html,
        }
        const response = await sendEmail(data)
        if (!response) return responseData(res, 400, 1, 'Send email failed')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const resetPassword = async (req, res) => {
    try {
        const { password, token } = req.body
        if (!password || !token)
            return responseData(res, 400, 1, 'Password or token invalid')
        const passwordResetToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')
        const user = await User.findOne({
            passwordResetToken,
            passwordResetExpires: { $gt: Date.now() },
        })
        if (!user) return responseData(res, 400, 1, 'Invalid reset token')
        user.password = hashPassword(password)
        user.passwordResetToken = undefined
        user.passwordChangeAt = Date.now()
        user.passwordResetExpires = undefined
        await user.save()
        responseData(res, 200, 0, 'Reset password successfully')
    } catch (error) {
        responseData(res, 500, 1, error.message)
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
