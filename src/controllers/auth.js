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
const makeToken = require('uniqid')

const verifyEmail = async (req, res) => {
    try {
        const { data, dataModel } = req
        if (dataModel) return responseData(res, 400, 1, 'Email đã tồn tại')
        const token = makeToken()
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        res.cookie(
            'dataRegister',
            { ...data, token, code },
            {
                httpOnly: true,
                maxAge: 15 * 60 * 1000,
            }
        )
        const dataPayload = {
            email: data.email,
            template: 'Register',
            subject: 'Account registration process',
            context: { code },
        }
        await sendEmail(dataPayload)
        responseData(res, 200, 0, '', undefined, { ...data, token, code })
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const register = async (req, res) => {
    try {
        const { data } = req
        const username = data.email.split('@')[0]
        const dataNewUser = {
            ...data,
            username,
            password: hashPassword(data.password),
            dateOfBirth: new Date('01-01-2000'),
        }
        const newUser = await User.create(dataNewUser)
        if (!newUser) return responseData(res, 400, 1, 'Register failed')

        const user = await User.findById(newUser._id).populate(
            'role',
            'roleName'
        )
        if (!user) return responseData(res, 400, 1, 'Register failed')

        const userObject = user.toObject()
        const { password, ...response } = userObject

        const payload = { _id: response._id, role: response.role.roleName }
        const accessToken = generateAccessToken(payload, '2d')
        const newRefreshToken = generateRefreshToken(user._id)

        await User.findByIdAndUpdate(
            user._id,
            { refreshToken: newRefreshToken },
            { new: true }
        )

        responseData(
            res,
            201,
            0,
            'Register successfully',
            `Bearer ${accessToken}`,
            response
        )
    } catch (error) {
        console.log(error)
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
        const role = response.role.roleName
        const payload = { _id: user._id, role }
        const accessToken = generateAccessToken(payload, '2d')
        const newRefreshToken = generateRefreshToken(user._id)
        await User.findByIdAndUpdate(
            user._id,
            { refreshToken: newRefreshToken },
            { new: true }
        )

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        responseData(
            res,
            200,
            0,
            'Login successfully',
            `Bearer ${accessToken}`,
            response
        )
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const generateNewToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies

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

                const newToken = generateAccessToken(
                    { _id: user._id, role: user.role },
                    '2d'
                )

                responseData(res, 201, 0, `Bearer ${newToken}`)
            }
        )
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies

        if (!refreshToken) {
            return responseData(res, 401, 1, 'Not log in')
        }

        await User.findOneAndUpdate(
            {
                refreshToken,
            },
            { refreshToken: '' },
            { new: true }
        )

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
        const { email } = req.body
        if (!email) return responseData(res, 400, 1, 'Email invalid')
        const user = await User.findOne({ email })
        if (!user) return responseData(res, 404, 1, 'User not found')
        const resetToken = user.createPasswordChangeToken()
        await user.save()

        const dataPayload = {
            email: email,
            template: 'ForgotPassword',
            subject: 'Thiết lập lại mật khẩu đăng nhập Shopee',
            context: {
                link: `${process.env.REQUEST_URL}/reset-password`,
                username: user.username,
            },
        }
        const response = await sendEmail(dataPayload)
        if (!response) return responseData(res, 400, 1, 'Send email failed')
        responseData(res, 200, 0, resetToken)
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params
        const { password } = req.body
        if (!token) return responseData(res, 400, 1, 'Token invalid')
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
        responseData(res, 200, 0, 'Reset password successful')
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    register,
    verifyEmail,
    login,
    generateNewToken,
    logout,
    fortgotPassword,
    resetPassword,
}
