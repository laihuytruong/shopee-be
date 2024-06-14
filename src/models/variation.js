const mongoose = require('mongoose')

const VariationSchema = new mongoose.Schema(
    {
        categoryId: {
            type: mongoose.Types.ObjectId,
            ref: 'Category',
        },
        name: {
            type: String
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Variation', VariationSchema)
