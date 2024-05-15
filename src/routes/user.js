const express = require('express')
const userController = require('../controllers/user')
const { verifyToken } = require('../middleware/middlewares')

const router = express.Router()

router.get('/current', verifyToken, userController.getCurrentUser)
router.get('/', userController.getAllUsers)

module.exports = router
