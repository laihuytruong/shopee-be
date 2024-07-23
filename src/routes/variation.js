const express = require('express')
const variationController = require('../controllers/variation')
const {
    verifyToken,
    checkAdmin,
    getData,
    checkExist,
} = require('../middleware/middlewares')
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
    variationController.updateVariation
)

router.post('/', verifyToken, checkAdmin, variationController.createVariation)

router.get('/', verifyToken, checkAdmin, variationController.getAllVariations)

module.exports = router
