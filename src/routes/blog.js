const express = require('express')
const blogController = require('../controllers/blog')
const {
    verifyToken,
    checkAdmin,
    getData,
    checkExist,
} = require('../middleware/middlewares')
const {} = require('../middleware/validation/productValidation')
const { checkSchema } = require('express-validator')
const uploadCloud = require('../middleware/cloudinary')
const Product = require('../models/product')
const { blogValidation } = require('../middleware/validation/blogValidation')

const router = express.Router()

router.delete('/:bid', verifyToken, blogController.deleteBlog)

router.put('/dislike/:bid', verifyToken, blogController.dislikeBlog)
router.put('/like/:bid', verifyToken, blogController.likeBlog)

router.put(
    '/:bid',
    verifyToken,
    checkSchema(blogValidation),
    getData,
    blogController.updateBlog
)

router.post(
    '/',
    verifyToken,
    checkSchema(blogValidation),
    getData,
    blogController.createBlog
)

router.get('/:bid', verifyToken, blogController.getBlog)
router.get('/', verifyToken, blogController.getAllBlogs)

module.exports = router
