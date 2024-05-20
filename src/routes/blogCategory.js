const express = require('express')
const blogCategoryController = require('../controllers/blogCategory')
const {
    verifyToken,
    checkAdmin,
    getData,
    checkExist,
} = require('../middleware/middlewares')
const uploadCloud = require('../middleware/cloudinary')
const BlogCategory = require('../models/blogCategory')

const router = express.Router()

router.delete(
    '/:_id',
    verifyToken,
    checkAdmin,
    blogCategoryController.deleteBlogCategory
)

router.put(
    '/:_id',
    verifyToken,
    checkAdmin,
    checkExist(BlogCategory, 'blogCategoryName', false),
    blogCategoryController.updateBlogCategory
)

router.post(
    '/',
    verifyToken,
    checkAdmin,
    checkExist(BlogCategory, 'blogCategoryName', false),
    blogCategoryController.createBlogCategory
)

router.get('/:_id', verifyToken, blogCategoryController.getBlogCategory)
router.get('/', verifyToken, blogCategoryController.getAllBlogCategories)

module.exports = router
