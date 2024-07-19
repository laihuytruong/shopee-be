const express = require('express')
const categoryController = require('../controllers/category')
const {
    verifyToken,
    checkAdmin,
    getData,
    checkExist,
} = require('../middleware/middlewares')
const {
    categoryValidation,
} = require('../middleware/validation/role_categoryValidation')
const { checkSchema } = require('express-validator')
const uploadCloud = require('../middleware/cloudinary')
const Category = require('../models/category')

const router = express.Router()

router.delete(
    '/:_id',
    verifyToken,
    checkAdmin,
    categoryController.deleteCategory
)

router.put(
    '/upload/:_id',
    verifyToken,
    checkAdmin,
    uploadCloud.single('thumbnail'),
    categoryController.uploadImageCategory
)

router.put(
    '/:_id',
    verifyToken,
    checkAdmin,
    uploadCloud.single('thumbnail'),
    categoryController.updateCategory
)

router.post(
    '/',
    verifyToken,
    checkAdmin,
    uploadCloud.single('thumbnail'),
    categoryController.createCategory
)

router.get('/:_id', categoryController.getOneCategory)
router.get('/', categoryController.getAllCategories)

module.exports = router
