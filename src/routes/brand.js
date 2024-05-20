const express = require('express')
const brandController = require('../controllers/brand')
const {
    verifyToken,
    checkAdmin,
    checkExist,
} = require('../middleware/middlewares')
const Brand = require('../models/brand')

const router = express.Router()

router.delete('/:_id', verifyToken, checkAdmin, brandController.deleteBrand)

router.put(
    '/:_id',
    verifyToken,
    checkAdmin,
    checkExist(Brand, 'brandName', false),
    brandController.updateBrand
)

router.post(
    '/',
    verifyToken,
    checkAdmin,
    checkExist(Brand, 'brandName', false),
    brandController.createBrand
)

router.get('/:_id', verifyToken, brandController.getBrand)
router.get('/', verifyToken, brandController.getAllBrands)

module.exports = router
