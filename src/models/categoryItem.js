const mongoose = require('mongoose')

const CategoryItemSchema = new mongoose.Schema(
    {
        categoryItemName: {
            type: String,
            require: true,
            unique: true,
        },
        slug: {
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

module.exports = mongoose.model('CategoryItem', CategoryItemSchema)
