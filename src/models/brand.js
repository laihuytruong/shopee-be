const mongoose = require('mongoose')

const BrandSchema = new mongoose.Schema(
    {
        brandName: {
            type: String,
            require: true,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Brand', BrandSchema)
