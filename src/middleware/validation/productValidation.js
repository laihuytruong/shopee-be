const mongoose = require('mongoose')

const productValidation = {
    productName: {
        notEmpty: {
            errorMessage: 'Product name cannot be empty',
        },
    },
    brand: {
        custom: {
            options: (value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid brand id')
                }
                return true
            },
        },
    },
    price: {
        notEmpty: {
            errorMessage: 'Price cannot be empty',
        },
    },
    categoryItem: {
        custom: {
            options: (value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid category item id')
                }
                return true
            },
        },
    },
    quantity: {},
    sold: {},
    image: {},
    discount: {},
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

const productDetailValidation = {
    image: {},
    color: {},
    size: {},
    price: {
        notEmpty: {
            errorMessage: 'Image cannot be empty',
        },
    },
    inventory: {},
    product: {
        custom: {
            options: (value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid product detail id')
                }
                return true
            },
        },
    },
}

module.exports = {
    productValidation,
    ratingValidation,
    productDetailValidation,
}
