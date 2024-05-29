const express = require('express')
const categoryItemController = require('../controllers/categoryItem')
const {
    verifyToken,
    checkAdmin,
    getData,
    checkExist,
} = require('../middleware/middlewares')
const {
    categoryItemValidation,
} = require('../middleware/validation/role_categoryValidation')
const { checkSchema } = require('express-validator')
const CategoryItem = require('../models/categoryItem')

const router = express.Router()

router.delete(
    '/:_id',
    verifyToken,
    checkAdmin,
    categoryItemController.deleteCategoryItem
)

router.put(
    '/:_id',
    verifyToken,
    checkAdmin,
    checkSchema(categoryItemValidation),
    getData,
    categoryItemController.updateCategoryItem
)

router.post(
    '/',
    verifyToken,
    checkAdmin,
    checkSchema(categoryItemValidation),
    getData,
    checkExist(CategoryItem, 'categoryItemName', false),
    categoryItemController.createCategoryItem
)

router.get('/filter/:slug', categoryItemController.getItemBySlug)
router.get('/:_id', categoryItemController.getCategoryItem)
router.get('/', categoryItemController.getAllCategoryItems)

module.exports = router
