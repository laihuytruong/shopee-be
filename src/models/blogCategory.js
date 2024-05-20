const mongoose = require('mongoose')

const BlogCategorySchema = new mongoose.Schema(
    {
        blogCategoryName: {
            type: String,
            require: true,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('BlogCategory', BlogCategorySchema)
