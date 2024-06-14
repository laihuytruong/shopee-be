const express = require('express')
const userController = require('../controllers/user')
const {
    verifyToken,
    checkAdmin,
    getData,
} = require('../middleware/middlewares')
const {
    updateUserValidation,
    updateUserByAdminValidation,
    cartUserValidation,
} = require('../middleware/validation/userValidation')
const { checkSchema } = require('express-validator')
const uploadCloud = require('../middleware/cloudinary')
const router = express.Router()

router.delete('/:_id', verifyToken, checkAdmin, userController.deleteUser)
router.put(
    '/upload',
    verifyToken,
    uploadCloud.single('avatar'),
    userController.uploadAvatar
)
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
    '/change-password/:_id',
    verifyToken,
    userController.changePassword
)

router.put(
    '/current/:_id',
    verifyToken,
    checkSchema(updateUserValidation),
    getData,
    userController.updateUser
)
router.get('/current', verifyToken, userController.getCurrentUser)
router.get('/', verifyToken, checkAdmin, userController.getAllUsers)

module.exports = router
