const mongoose = require('mongoose')

const blogValidation = {
    title: {
        notEmpty: {
            errorMessage: 'Title cannot be empty',
        },
    },
    description: {
        notEmpty: {
            errorMessage: 'Description cannot be empty',
        },
    },
    category: {
        notEmpty: {
            errorMessage: 'Category cannot be empty',
        },
        custom: {
            options: (value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid blog category id')
                }
                return true
            },
        },
    },
    thumbnail: {},
}

module.exports = {
    blogValidation,
}
