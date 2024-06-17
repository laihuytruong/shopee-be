const mongoose = require('mongoose')
const crypto = require('crypto')

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
        },
        email: {
            type: String,
            require: true,
            unique: true,
        },
        username: {
            type: String,
        },
        password: {
            type: String,
            require: true,
        },
        confirmPassword: {
            type: String,
            require: true,
        },
        phoneNumber: {
            type: String,
        },
        sex: {
            type: String,
            enum: ['male', 'female', 'other'],
        },
        dateOfBirth: {
            type: Date,
            default: new Date('2000-01-01'),
        },
        avatar: {
            type: String,
            default: 'https://bit.ly/3ycA2mE',
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        cart: [
            {
                productDetail: {
                    type: mongoose.Types.ObjectId,
                    ref: 'ProductDetail',
                },
                quantity: Number,
                variationOption: {
                    type: mongoose.Types.ObjectId,
                    ref: 'VariationOption',
                }
            },
        ],
        address: {
            type: String,
        },
        role: {
            type: mongoose.Types.ObjectId,
            default: new mongoose.Types.ObjectId('6646091905062f8ea9e1e7a8'),
            ref: 'Role',
        },
        refreshToken: {
            type: String,
        },
        passwordChangeAt: {
            type: String,
        },
        passwordResetToken: {
            type: String,
        },
        passwordResetExpires: {
            type: String,
        },
        registerToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

UserSchema.methods = {
    createPasswordChangeToken: function () {
        const resetToken = crypto.randomBytes(32).toString('hex')
        this.passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex')
        this.passwordResetExpires = Date.now() + 15 * 60 * 1000
        return resetToken
    },
}

module.exports = mongoose.model('User', UserSchema)
