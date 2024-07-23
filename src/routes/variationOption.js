const express = require('express')
const variationOptionController = require('../controllers/variationOption')
const { verifyToken, checkAdmin } = require('../middleware/middlewares')
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
    variationOptionController.updateOption
)

router.post(
    '/',
    verifyToken,
    checkAdmin,
    variationOptionController.createOption
)

router.get(
    '/',
    verifyToken,
    checkAdmin,
    variationOptionController.getAllOptions
)

module.exports = router
