const express = require('express')
const variationController = require('../controllers/variation')
const {
    verifyToken,
    checkAdmin,
    getData,
    checkExist,
} = require('../middleware/middlewares')
const {
    variationValidation,
} = require('../middleware/validation/productValidation')
const { checkSchema } = require('express-validator')
const Variation = require('../models/variation')
const router = express.Router()

router.delete(
    '/:_id',
    verifyToken,
    checkAdmin,
    variationController.deleteVariation
)

router.put(
    '/:_id',
    verifyToken,
    checkAdmin,
    checkSchema(variationValidation),
    getData,
    checkExist(Variation, 'name', false),
    variationController.updateVariation
)

router.post(
    '/',
    verifyToken,
    checkAdmin,
    checkSchema(variationValidation),
    getData,
    checkExist(Variation, 'name', false),
    variationController.createVariation
)

router.get('/', verifyToken, checkAdmin, variationController.getAllVariations)

module.exports = router
