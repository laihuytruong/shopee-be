const express = require('express')
const productDetailController = require('../controllers/productDetail')
const {
    verifyToken,
    checkAdmin,
    getData,
} = require('../middleware/middlewares')
const {
    productDetailValidation,
} = require('../middleware/validation/productValidation')
const { checkSchema } = require('express-validator')
const uploadCloud = require('../middleware/cloudinary')
const ProductDetail = require('../models/productDetail')

const router = express.Router()

router.delete(
    '/:_id',
    verifyToken,
    checkAdmin,
    productDetailController.deleteProductDetail
)

router.put(
    '/update-inventory',
    verifyToken,
    productDetailController.updateInventory
)

router.put(
    '/:_id',
    verifyToken,
    checkAdmin,
    uploadCloud.single('image'),
    checkSchema(productDetailValidation),
    getData,
    productDetailController.updateProductDetail
)

router.post(
    '/',
    verifyToken,
    checkAdmin,
    uploadCloud.single('image'),
    checkSchema(productDetailValidation),
    getData,
    productDetailController.createProductDetail
)

router.get('/:slug', productDetailController.getProductDetail)

module.exports = router
