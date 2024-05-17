const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            require: true,
            trim: true,
        },
        slug: {
            type: String,
            require: true,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
        },
        brand: {
            type: String,
            require: true,
        },
        price: {
            type: Number,
            require: true,
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref: 'Category',
        },
        quantity: {
            type: Number,
            default: 0,
        },
        sold: {
            type: Number,
            default: 0,
        },
        image: {
            type: Array,
        },
        color: {
            type: Array,
        },
        rating: [
            {
                star: {
                    type: Number,
                },
                votedBy: {
                    type: mongoose.Types.ObjectId,
                    ref: 'User',
                },
                comment: {
                    type: String,
                },
            },
        ],
        totalRating: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Product', ProductSchema)
