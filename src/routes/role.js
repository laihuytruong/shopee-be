const express = require('express')
const roleController = require('../controllers/role')
const {
    verifyToken,
    checkAdmin,
    getData,
    checkExist,
} = require('../middleware/middlewares')
const {
    roleValidation,
} = require('../middleware/validation/role_categoryValidation')
const { checkSchema } = require('express-validator')
const Role = require('../models/role')

const router = express.Router()

router.delete('/:_id', verifyToken, checkAdmin, roleController.deleteRole)

router.put(
    '/:_id',
    verifyToken,
    checkAdmin,
    checkSchema(roleValidation),
    getData,
    roleController.updateRole
)

router.post(
    '/',
    verifyToken,
    checkAdmin,
    checkSchema(roleValidation),
    getData,
    checkExist(Role, 'roleName', true),
    roleController.createRole
)

router.get('/', verifyToken, checkAdmin, roleController.getAllRoles)

module.exports = router
