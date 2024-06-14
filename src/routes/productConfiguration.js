const express = require('express')
const productConfigurationController = require('../controllers/productConfiguration')
const {
    verifyToken,
    checkAdmin,
    getData,
    checkExist,
} = require('../middleware/middlewares')
const {
    productConfigurationValidation,
} = require('../middleware/validation/productValidation')
const { checkSchema } = require('express-validator')

const router = express.Router()

router.delete(
    '/:_id',
    verifyToken,
    checkAdmin,
    productConfigurationController.deleteProductConfiguration
)

router.put(
    '/:_id',
    verifyToken,
    checkAdmin,
    checkSchema(productConfigurationValidation),
    getData,
    productConfigurationController.updateConfiguration
)

router.post(
    '/',
    verifyToken,
    checkAdmin,
    checkSchema(productConfigurationValidation),
    getData,
    productConfigurationController.createConfiguration
)

router.get(
    '/',
    verifyToken,
    checkAdmin,
    productConfigurationController.getAllConfigurations
)

module.exports = router
