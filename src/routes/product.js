const express = require('express')
const productController = require('../controllers/product')
const {
    verifyToken,
    checkAdmin,
    getData,
    checkExist,
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

router.put('/update-quantity', verifyToken, productController.updateQuantities)

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
    checkAdmin,
    uploadCloud.array('image', 10),
    checkSchema(productValidation),
    getData,
    productController.updateProduct
)

router.put(
    '/upload/:_id',
    verifyToken,
    checkAdmin,
    uploadCloud.array('image', 10),
    productController.uploadImagesProduct
)

router.post(
    '/',
    verifyToken,
    checkAdmin,
    uploadCloud.array('image', 10),
    checkSchema(productValidation),
    getData,
    productController.createProduct
)
router.post('/filter', verifyToken, productController.filter)
router.get('/search', productController.search)

router.get(
    '/category/:slug',
    verifyToken,
    productController.getProductsByCategory
)
router.get('/product/:productName', productController.getProductByProductName)
router.get('/:_id', productController.getProductById)
router.get('/', productController.getAllProducts)

module.exports = router
