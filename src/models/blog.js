const mongoose = require('mongoose')

const BlogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            require: true,
        },
        description: {
            type: String,
            require: true,
        },
        category: {
            type: String,
            require: true,
        },
        numberViews: {
            type: Number,
            default: 0,
        },
        viewedBy: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
        ],
        likes: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
        ],
        dislikes: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
        ],
        thumbnail: {
            type: String,
            default:
                'https://st2.depositphotos.com/1006899/8421/i/450/depositphotos_84219350-stock-photo-word-blog-suspended-by-ropes.jpg',
        },
        author: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

module.exports = mongoose.model('Blog', BlogSchema)
