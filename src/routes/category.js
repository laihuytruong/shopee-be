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
    '/:_id',
    verifyToken,
    checkAdmin,
    uploadCloud.single('thumbnail'),
    checkSchema(categoryValidation),
    getData,
    categoryController.updateCategory
)

router.post(
    '/',
    verifyToken,
    checkAdmin,
    uploadCloud.single('thumbnail'),
    checkSchema(categoryValidation),
    getData,
    checkExist(Category, 'categoryName', false),
    categoryController.createCategory
)

router.get('/:_id', verifyToken, checkAdmin, categoryController.getOneCategory)
router.get('/', verifyToken, checkAdmin, categoryController.getAllCategories)

module.exports = router
