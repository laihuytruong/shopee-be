const mongoose = require('mongoose')
const Blog = require('../models/blog')
const { responseData } = require('../utils/helpers')
const BlogCategory = require('../models/blogCategory')

const getAllBlogs = async (req, res) => {
    try {
        const response = await Blog.find()
        if (!response) return responseData(res, 404, 0, 'No blog found')
        responseData(res, 200, 0, '', response.length, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getBlog = async (req, res) => {
    try {
        const {
            params: { bid },
            user: { _id },
        } = req
        if (!bid || !mongoose.Types.ObjectId.isValid(bid)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }

        const blog = await Blog.findById(bid)

        if (!blog) {
            return responseData(res, 404, 1, 'No blog found')
        }

        // Kiểm tra xem người dùng đã xem blog chưa
        const hasViewed = blog.viewedBy.includes(_id)
        if (!hasViewed) {
            // Tăng số lượt xem và thêm người dùng vào danh sách đã xem
            blog.numberViews += 1
            blog.viewedBy.push(_id)
            await blog.save()
        }

        const response = await Blog.findById(bid)
            .populate('category', 'blogCategoryName', 'BlogCategory')
            .populate('viewedBy', 'firstName lastName')
            .populate('likes', 'firstName lastName')
            .populate('dislikes', 'firstName lastName')
            .populate('author', 'firstName lastName')
        if (!response) return responseData(res, 400, 0, 'No blog found')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createBlog = async (req, res) => {
    try {
        const {
            data,
            user: { _id },
        } = req

        // Kiểm tra xem blog category đã tồn tại hay chưa
        const blogCategory = await BlogCategory.findById(
            new mongoose.Types.ObjectId(data.category)
        )
        if (!blogCategory)
            return responseData(res, 404, 1, 'Blog category not found')
        data.category = new mongoose.Types.ObjectId(data.category)
        data.author = new mongoose.Types.ObjectId(_id)
        console.log(data)

        const response = await Blog.create(data)
        if (!response) return responseData(res, 201, 0, 'Create blog failed')
        responseData(res, 201, 0, 'Create blog successfully', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const updateBlog = async (req, res) => {
    try {
        const {
            data,
            params: { bid },
        } = req
        if (!bid || !mongoose.Types.ObjectId.isValid(bid)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        const blogCategory = await BlogCategory.findById(
            new mongoose.Types.ObjectId(data.category)
        )
        if (!blogCategory)
            return responseData(res, 404, 1, 'Blog category not found')
        data.category = new mongoose.Types.ObjectId(data.category)

        const response = await Blog.findByIdAndUpdate(bid, data, { new: true })
        if (!response) return responseData(res, 400, 0, 'Update blog failed')
        responseData(res, 200, 0, 'Update blog successfully')
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const likeBlog = async (req, res) => {
    try {
        const { _id } = req.user
        const { bid } = req.params
        if (!bid || !mongoose.Types.ObjectId.isValid(bid)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        const blog = await Blog.findById(bid)
        if (!blog) return responseData(res, 404, 1, 'Blog not found')
        const isDisliked = blog.dislikes.find((el) => el.toString() === _id)
        if (isDisliked) {
            const response = await Blog.findByIdAndUpdate(
                bid,
                {
                    $pull: { dislikes: _id },
                    $push: { likes: _id },
                },
                { new: true }
            )
            return responseData(res, 200, 0, '', null, response)
        }
        const isLiked = blog.likes.find((el) => el.toString() === _id)
        if (isLiked) {
            const response = await Blog.findByIdAndUpdate(
                bid,
                {
                    $pull: { likes: _id },
                },
                { new: true }
            )
            return responseData(res, 200, 0, '', null, response)
        } else {
            const response = await Blog.findByIdAndUpdate(
                bid,
                {
                    $push: { likes: _id },
                },
                { new: true }
            )
            return responseData(res, 200, 0, '', null, response)
        }
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const dislikeBlog = async (req, res) => {
    try {
        const { _id } = req.user
        const { bid } = req.params
        if (!bid || !mongoose.Types.ObjectId.isValid(bid)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        const blog = await Blog.findById(bid)
        if (!blog) return responseData(res, 404, 1, 'Blog not found')
        const isLiked = blog.likes.find((el) => el.toString() === _id)
        if (isLiked) {
            const response = await Blog.findByIdAndUpdate(
                bid,
                {
                    $pull: { likes: _id },
                    $push: { dislikes: _id },
                },
                { new: true }
            )
            return responseData(res, 200, 0, '', null, response)
        }
        const isDisliked = blog.dislikes.find((el) => el.toString() === _id)
        if (isDisliked) {
            const response = await Blog.findByIdAndUpdate(
                bid,
                {
                    $pull: { dislikes: _id },
                },
                { new: true }
            )
            return responseData(res, 200, 0, '', null, response)
        } else {
            const response = await Blog.findByIdAndUpdate(
                bid,
                {
                    $push: { dislikes: _id },
                },
                { new: true }
            )
            return responseData(res, 200, 0, '', null, response)
        }
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const deleteBlog = async (req, res) => {
    try {
        const { bid } = req.params
        if (!bid || !mongoose.Types.ObjectId.isValid(bid)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }

        const response = await Blog.findByIdAndDelete(bid)
        if (!response) return responseData(res, 400, 0, 'Delete blog failed')
        return responseData(res, 200, 0, 'Delete blog successfully')
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const uploadImageBlog = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        console.log(req.files)
        if (!req.file) return responseData(res, 400, 1, 'No image upload')
        const response = await Blog.findByIdAndUpdate(
            _id,
            {
                thumbnail: req.file.path,
            },
            { new: true }
        )
        console.log(response)
        if (!response) return responseData(res, 400, 1, 'Upload image failed')
        responseData(res, 200, 1, 'Upload image successfully', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    createBlog,
    updateBlog,
    getAllBlogs,
    getBlog,
    likeBlog,
    dislikeBlog,
    deleteBlog,
    uploadImageBlog,
}
