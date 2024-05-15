const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            require: true,
        },
        lastName: {
            type: String,
            require: true,
        },
        email: {
            type: String,
            require: true,
            unique: true,
        },
        password: {
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
        },
        avatar: {
            type: String,
            default: 'https://bit.ly/3ycA2mE',
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        address: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'Address',
            },
        ],
        role: {
            type: String,
            default: 'user',
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
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('User', UserSchema)
