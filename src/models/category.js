const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            require: true,
            // unique: true,
        },
        thumbnail: {
            type: String,
            require: true,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Category', CategorySchema)
