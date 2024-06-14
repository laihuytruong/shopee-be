const mongoose = require('mongoose')
const { bodyValidation } = require('./authValidation')

const updateUserValidation = {
    email: {
        notEmpty: {
            errorMessage: 'Email cannot be empty',
        },
        isEmail: {
            errorMessage: 'Invalid email format. Email format is abc@gmail.com',
        },
    },
    ...bodyValidation,
}

const updateUserByAdminValidation = {
    role: {
        notEmpty: {
            errorMessage: 'Role cannot be empty',
        },
        custom: {
            options: (value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid role')
                }
                return true
            },
        },
    },
    isBlocked: {
        custom: {
            options: (value) => {
                const booleanValue = JSON.parse(value)
                if (typeof booleanValue !== 'boolean') {
                    throw new Error('Is blocked must be a boolean value')
                }
                return true
            },
        },
    },
}

const cartUserValidation = {
    pid: {
        notEmpty: {
            errorMessage: 'Product id cannot be empty',
        },
        custom: {
            options: (value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid product id')
                }
                return true
            },
        },
    },
    quantity: {
        notEmpty: {
            errorMessage: 'Quantity cannot be empty',
        },
    },
    color: {
        notEmpty: {
            errorMessage: 'Color cannot be empty',
        },
    },
}

module.exports = {
    updateUserValidation,
    updateUserByAdminValidation,
    cartUserValidation,
}
