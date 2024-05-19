const mongoose = require('mongoose')

const productValidation = {
    productName: {
        notEmpty: {
            errorMessage: 'Product name cannot be empty',
        },
    },
    brand: {
        notEmpty: {
            errorMessage: 'Brand cannot be empty',
        },
    },
    description: {},
    price: {
        notEmpty: {
            errorMessage: 'Price cannot be empty',
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
    quantity: {},
    sold: {},
    image: {},
    color: {},
    totalRating: {},
}

const ratingValidation = {
    star: {
        notEmpty: {
            errorMessage: 'Star cannot be empty',
        },
    },
    comment: {},
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
}

module.exports = {
    productValidation,
    ratingValidation,
}
