const express = require('express')
const userController = require('../controllers/user')
const {
    verifyToken,
    checkAdmin,
    getData,
    checkExist,
} = require('../middleware/middlewares')
const {
    updateUserValidation,
    updateUserByAdminValidation,
    cartUserValidation,
} = require('../middleware/validation/userValidation')
const { checkSchema } = require('express-validator')
const uploadCloud = require('../middleware/cloudinary')
const User = require('../models/user')
const router = express.Router()

router.delete('/:_id', verifyToken, checkAdmin, userController.deleteUser)
router.put('/address', verifyToken, userController.updateUserAddress)
router.put(
    '/cart',
    verifyToken,
    checkSchema(cartUserValidation),
    getData,
    userController.updateCart
)
router.put(
    '/:_id',
    verifyToken,
    checkAdmin,
    checkSchema(updateUserByAdminValidation),
    getData,
    userController.updateUserByAdmin
)
router.put(
    '/current/:_id',
    verifyToken,
    uploadCloud.single('avatar'),
    checkSchema(updateUserValidation),
    getData,
    userController.updateUser
)
router.get('/current', verifyToken, userController.getCurrentUser)
router.get('/', verifyToken, checkAdmin, userController.getAllUsers)

module.exports = router
