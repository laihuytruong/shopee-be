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

const productConfigurationValidation = {
    productDetailId: {
        custom: {
            options: (value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid product detail id')
                }
                return true
            },
        },
    },
    variationOptionId: {
        custom: {
            options: (value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid variation option id')
                }
                return true
            },
        },
    },
}

const variationOptionValidation = {
    variationId: {
        custom: {
            options: (value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid variation id')
                }
                return true
            },
        },
    },
    value: {
        notEmpty: {
            errorMessage: 'Value cannot be empty',
        },
    },
}

const variationValidation = {
    categoryId: {
        custom: {
            options: (value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid category id')
                }
                return true
            },
        },
    },
    name: {
        notEmpty: {
            errorMessage: 'Name cannot be empty',
        },
    },
}

module.exports = {
    productValidation,
    ratingValidation,
    productDetailValidation,
    productConfigurationValidation,
    variationOptionValidation,
    variationValidation,
}
