const mongoose = require('mongoose')

const ProductDetailSchema = new mongoose.Schema(
    {
        productDetailName: {
            type: String,
            require: true,
            unique: true,
        },
        slug: {
            type: String,
        },
        image: {
            type: String,
        },
        color: {
            type: String,
        },
        size: {
            type: String,
        },
        price: {
            type: Number,
        },
        inventory: {
            type: Number,
            default: 0,
        },
        product: {
            type: mongoose.Types.ObjectId,
            ref: 'Product',
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('ProductDetail', ProductDetailSchema)
