const express = require('express')
const productController = require('../controllers/product')
const {
    verifyToken,
    checkSellerOrAdmin,
    getData,
} = require('../middleware/middlewares')
const {
    productValidation,
} = require('../middleware/validation/productValidation')
const { checkSchema } = require('express-validator')
const uploadCloud = require('../middleware/cloudinary')
const Product = require('../models/product')

const router = express.Router()

// router.delete('/:_id', verifyToken, checkAdmin, userController.deleteUser)
// router.put(
//     '/:_id',
//     verifyToken,
//     checkAdmin,
//     checkSchema(updateUserByAdminValidation),
//     getData,
//     userController.updateUserByAdmin
// )
// router.put(
//     '/current/:_id',
//     verifyToken,
//     uploadCloud.single('avatar'),
//     checkSchema(updateUserValidation),
//     getData,
//     userController.updateUser
// )

router.post(
    '/',
    verifyToken,
    checkSellerOrAdmin,
    uploadCloud.array('image'),
    checkSchema(productValidation),
    getData,
    productController.createProduct
)

router.get('/:_id', verifyToken, productController.getOneProduct)
router.get('/', verifyToken, productController.getAllProducts)

module.exports = router
