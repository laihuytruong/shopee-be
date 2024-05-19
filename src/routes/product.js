const express = require('express')
const productController = require('../controllers/product')
const {
    verifyToken,
    checkSellerOrAdmin,
    getData,
    checkExist,
    checkAdmin,
} = require('../middleware/middlewares')
const {
    productValidation,
    ratingValidation,
} = require('../middleware/validation/productValidation')
const { checkSchema } = require('express-validator')
const uploadCloud = require('../middleware/cloudinary')
const Product = require('../models/product')

const router = express.Router()

router.delete('/:_id', verifyToken, checkAdmin, productController.deleteProduct)

router.put(
    '/ratings',
    verifyToken,
    checkSchema(ratingValidation),
    getData,
    productController.handleRating
)

router.put(
    '/:_id',
    verifyToken,
    // uploadCloud.single('avatar'),
    checkSellerOrAdmin,
    checkSchema(productValidation),
    getData,
    productController.updateProduct
)

router.post(
    '/',
    verifyToken,
    checkSellerOrAdmin,
    // uploadCloud.array('image'),
    checkSchema(productValidation),
    getData,
    productController.createProduct
)

router.get('/:_id', productController.getOneProduct)
router.get('/', productController.getAllProducts)

module.exports = router
