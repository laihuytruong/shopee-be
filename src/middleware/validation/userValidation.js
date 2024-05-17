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
    address: {
        // custom: {
        //     options: (value) => {
        //         try {
        //             if (value.length > 1) {
        //                 value.forEach((item) => {
        //                     if (!mongoose.Types.ObjectId.isValid(item)) {
        //                         throw new Error(
        //                             'Address must contain only valid ObjectIds'
        //                         )
        //                     }
        //                     return true
        //                 })
        //             }
        //             return true
        //         } catch (error) {
        //             throw new Error(error.message)
        //         }
        //     },
        // },
    },
    avatar: {},
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

module.exports = {
    updateUserValidation,
    updateUserByAdminValidation,
}
