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
        },
        brand: {
            type: mongoose.Types.ObjectId,
            ref: 'Brand',
        },
        price: {
            type: Number,
            require: true,
        },
        categoryItem: {
            type: mongoose.Types.ObjectId,
            ref: 'CategoryItem',
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
            type: [String],
            default: [
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfFeFLwcGPyiM6MgD4eMSBmfKPQCQTQc-pDKQa1s8&s',
            ],
            validate: [arrayLimit, 'Image array exceeds the limit of 5'],
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
            },
        ],
        totalRating: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

function arrayLimit(val) {
    return val.length <= 5
}

module.exports = mongoose.model('Product', ProductSchema)
