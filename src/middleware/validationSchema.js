const authValidation = {
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

const registerValidation = {
    ...authValidation,
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
}

module.exports = {
    authValidation,
    registerValidation,
}
