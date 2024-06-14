const mongoose = require('mongoose')

const VariationOptionSchema = new mongoose.Schema(
    {
        variationId: {
            type: mongoose.Types.ObjectId,
            ref: 'Variation',
        },
        value: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('VariationOption', VariationOptionSchema)
