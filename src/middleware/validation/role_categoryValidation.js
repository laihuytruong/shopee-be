const mongoose = require('mongoose')

const roleValidation = {
    roleName: {
        notEmpty: {
            errorMessage: 'Role name cannot be empty',
        },
    },
    description: {},
}

const categoryValidation = {
    categoryName: {
        notEmpty: {
            errorMessage: 'Category name cannot be empty',
        },
    },
    thumbnail: {},
}

const categoryItemValidation = {
    categoryItemName: {
        notEmpty: {
            errorMessage: 'Category item name cannot be empty',
        },
    },
    category: {
        custom: {
            options: (value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid category id')
                }
                return true
            },
        },
    },
}

module.exports = {
    roleValidation,
    categoryValidation,
    categoryItemValidation,
}
