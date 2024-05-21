const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema(
    {
        products: [
            {
                product: {
                    type: mongoose.Types.ObjectId,
                    ref: 'Product',
                },
                quantity: {
                    type: Number,
                },
                color: {
                    type: String,
                },
            },
        ],
        status: {
            type: String,
            default: 'Pending',
            enum: ['Cancel', 'Pending', 'Done', 'Delivering'],
        },
        total: {
            type: Number,
        },
        coupon: {
            type: mongoose.Types.ObjectId,
            ref: 'Coupon',
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
