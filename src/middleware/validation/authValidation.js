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
    oldPassword: {},
    newPassword: {},
    confirmPassword: {},
    name: {},
    phoneNumber: {},
    sex: {},
    address: {},
    dateOfBirth: {
        custom: {
            options: (value) => {
                if (value) {
                    const parts = value.split('/')
                    const day = parts[0].padStart(2, '0')
                    const month = parts[1].padStart(2, '0')
                    const year = parts[2]
                    const formattedDate = `${day}/${month}/${year}`
                    const birth = moment(formattedDate, 'DD/MM/YYYY', true)
                    if (!birth) {
                        throw new Error(
                            'Date of birth must be a dd/mm/yyyy format'
                        )
                    }
                    if (!birth.isValid()) {
                        throw new Error('Invalid date of birth')
                    }
                    return true
                }
            },
        },
    },
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
