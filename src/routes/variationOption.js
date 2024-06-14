const express = require('express')
const variationOptionController = require('../controllers/variationOption')
const {
    verifyToken,
    checkAdmin,
    getData,
    checkExist,
} = require('../middleware/middlewares')
const {
    variationOptionValidation,
} = require('../middleware/validation/productValidation')
const { checkSchema } = require('express-validator')
const VariationOption = require('../models/variationOption')
const router = express.Router()

router.delete(
    '/:_id',
    verifyToken,
    checkAdmin,
    variationOptionController.deleteOption
)

router.put(
    '/:_id',
    verifyToken,
    checkAdmin,
    checkSchema(variationOptionValidation),
    getData,
    checkExist(VariationOption, 'value', false),
    variationOptionController.updateOption
)

router.post(
    '/',
    verifyToken,
    checkAdmin,
    checkSchema(variationOptionValidation),
    getData,
    checkExist(VariationOption, 'value', false),
    variationOptionController.createOption
)

router.get(
    '/',
    verifyToken,
    checkAdmin,
    variationOptionController.getAllOptions
)

module.exports = router
