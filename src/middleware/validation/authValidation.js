const moment = require('moment')

const loginValidation = {
    email: {
        notEmpty: {
            errorMessage: 'Email cannot be empty',
        },
        isEmail: {
            errorMessage: 'Invalid email format. Email format is abc@gmail.com',
        },
    },
    password: {
        isLength: {
            options: {
                min: 6,
            },
            errorMessage: 'Password must be at least 6 characters',
        },
        notEmpty: {
            errorMessage: 'Password cannot be empty',
        },
    },
}

const bodyValidation = {
    username: {},
    name: {},
    phoneNumber: {},
    sex: {},
    address: {},
    dateOfBirth: {},
}

const emailValidation = {
    email: {
        notEmpty: {
            errorMessage: 'Email cannot be empty',
        },
        isEmail: {
            errorMessage: 'Invalid email format. Email format is abc@gmail.com',
        },
    },
}

const registerValidation = {
    ...emailValidation,
    password: {},
}

module.exports = {
    loginValidation,
    bodyValidation,
    emailValidation,
    registerValidation,
}
