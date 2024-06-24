const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema(
    {
        products: [
            {
                productDetail: {
                    type: mongoose.Types.ObjectId,
                    ref: 'ProductDetail',
                },
                quantity: {
                    type: Number,
                },
                variationOption: {
                    type: mongoose.Types.ObjectId,
                    ref: 'VariationOption',
                },
            },
        ],
        status: {
            type: String,
            default: 'Pending',
            enum: [
                'Cancel',
                'Pending',
                'Done',
                'Delivering',
                'Waiting Delivering',
            ],
        },
        orderBy: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Order', OrderSchema)
