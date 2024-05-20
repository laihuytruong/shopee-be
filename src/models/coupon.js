const mongoose = require('mongoose')

const CouponSchema = new mongoose.Schema(
    {
        couponName: {
            type: String,
            require: true,
        },
        discount: {
            type: Number,
            require: true,
        },
        expireDate: {
            type: Date,
            require: true,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Coupon', CouponSchema)
