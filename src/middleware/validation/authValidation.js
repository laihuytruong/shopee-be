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
    firstName: {
        notEmpty: {
            errorMessage: 'First name cannot be empty',
        },
    },
    lastName: {
        notEmpty: {
            errorMessage: 'Last name cannot be empty',
        },
    },
    phoneNumber: {
        notEmpty: {
            errorMessage: 'Phone number cannot be empty',
        },
        isLength: {
            options: {
                min: 10,
                max: 10,
            },
            errorMessage: 'Phone number must contain 10 number',
        },
        matches: {
            options: /^[0-9]+$/,
            errorMessage: 'Phone number must contain only numbers',
        },
    },
    sex: {
        notEmpty: {
            errorMessage: 'Sex cannot be empty',
        },
        custom: {
            options: (value) => {
                const validSexValues = ['male', 'female', 'other']
                if (!validSexValues.includes(value)) {
                    throw new Error('Sex must be one of male, female or other')
                }
                return true
            },
        },
    },
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

const registerValidation = {
    ...loginValidation,
    ...bodyValidation,
}

module.exports = {
    loginValidation,
    bodyValidation,
    registerValidation,
}
