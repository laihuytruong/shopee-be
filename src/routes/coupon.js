const express = require('express')
const couponController = require('../controllers/coupon')
const {
    verifyToken,
    checkAdmin,
    checkExist,
    getData,
} = require('../middleware/middlewares')
const Coupon = require('../models/coupon')
const { checkSchema } = require('express-validator')
const {
    couponValidation,
} = require('../middleware/validation/couponValidation')

const router = express.Router()

router.delete('/:_id', verifyToken, checkAdmin, couponController.deleteCoupon)

router.put(
    '/:_id',
    verifyToken,
    checkAdmin,
    checkSchema(couponValidation),
    getData,
    checkExist(Coupon, 'couponName', false),
    couponController.updateCoupon
)

router.post(
    '/',
    verifyToken,
    checkAdmin,
    checkSchema(couponValidation),
    getData,
    checkExist(Coupon, 'couponName', false),
    couponController.createCoupon
)

router.get('/:_id', verifyToken, couponController.getCoupon)
router.get('/', verifyToken, couponController.getAllCoupons)

module.exports = router
