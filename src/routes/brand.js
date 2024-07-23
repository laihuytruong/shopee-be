const express = require('express')
const brandController = require('../controllers/brand')
const {
    verifyToken,
    checkAdmin,
    checkExist,
} = require('../middleware/middlewares')
const uploadCloud = require('../middleware/cloudinary')
const Brand = require('../models/brand')

const router = express.Router()

router.delete('/:_id', verifyToken, checkAdmin, brandController.deleteBrand)

router.put('/:_id', verifyToken, checkAdmin, brandController.updateBrand)

router.post('/', verifyToken, checkAdmin, brandController.createBrand)

router.get('/filter/:slug', brandController.getBrandsBySlug)
router.get('/:_id', brandController.getBrand)
router.get('/', brandController.getAllBrands)

module.exports = router
