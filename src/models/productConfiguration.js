const mongoose = require('mongoose')

const ProductConfigurationSchema = new mongoose.Schema({
    productDetailId: {
        type: mongoose.Types.ObjectId,
        ref: 'ProductDetail',
    },
    variationOptionId: {
        type: mongoose.Types.ObjectId,
        ref: 'VariationOption',
    },
})

module.exports = mongoose.model(
    'ProductConfiguration',
    ProductConfigurationSchema
)
