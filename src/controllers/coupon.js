const Coupon = require('../models/coupon')
const { responseData } = require('../utils/helpers')
const mongoose = require('mongoose')
const moment = require('moment')

const getAllCoupons = async (req, res) => {
    try {
        const response = await Coupon.find()
        if (!response) return responseData(res, 400, 1, 'Cannot get coupons')
        responseData(res, 200, 0, '', response.length, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const getCoupon = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        const response = await Coupon.findById(_id)
        if (!response) return responseData(res, 400, 1, 'Cannot get coupon')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createCoupon = async (req, res) => {
    try {
        const { data, dataModel } = req
        if (dataModel)
            return responseData(res, 400, 1, 'Discount already exist')
        const response = await Coupon.create({
            ...data,
            discount: +data.discount,
            expireDate: moment(data.expireDate, 'DD/MM/YYYY').toDate(),
        })
        console.log(response)
        if (!response) return responseData(res, 400, 1, 'Create coupon failed')
        responseData(res, 201, 0, 'Create coupon successfully', null, response)
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const updateCoupon = async (req, res) => {
    try {
        const {
            data,
            params: { _id },
            dataModel,
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }

        if (!dataModel) return responseData(res, 404, 1, 'Coupon not found')
        const response = await Coupon.findByIdAndUpdate(
            _id,
            {
                ...data,
                expireDate: moment(data.expireDate, 'DD/MM/YYYY').toDate(),
            },
            { new: true }
        )
        if (!response) return responseData(res, 400, 1, 'Update coupon failed')
        responseData(res, 200, 0, 'Update coupon successfully', null, null)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const deleteCoupon = async (req, res) => {
    try {
        const {
            params: { _id },
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        const response = await Coupon.findByIdAndDelete(_id)
        if (!response) return responseData(res, 400, 1, 'Delete coupon failed')
        responseData(res, 200, 0, 'Delete coupon successfully', null, null)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    getAllCoupons,
    getCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
}
