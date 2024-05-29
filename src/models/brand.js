const mongoose = require('mongoose')

const BrandSchema = new mongoose.Schema(
    {
        brandName: {
            type: String,
            require: true,
        },
        image: {
            type: String,
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref: 'Category',
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Brand', BrandSchema)
