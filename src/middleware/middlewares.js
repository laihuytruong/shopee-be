const { validationResult, matchedData } = require('express-validator')
const jwt = require('jsonwebtoken')
const Role = require('../models/role')
const { responseData } = require('../utils/helpers')
const cloudinary = require('cloudinary').v2

const getData = (req, res, next) => {
    const result = validationResult(req)
    if (!result.isEmpty()) {
        if (req.file && req.file.path) {
            cloudinary.uploader.destroy(req.file.filename)
        }
        return res.status(400).json({
            err: 1,
            errors: result.array(),
        })
    }

    const data = matchedData(req)
    console.log('data: ', data)
    req.data = data
    next()
}

const checkExist = (model, columnName, lower) => async (req, res, next) => {
    try {
        const { data } = req
        const query = {}
        if (data) {
            query[columnName] =
                lower === false
                    ? data[columnName]
                    : data[columnName].toLowerCase()
        }
        const dataModel = await model.findOne(data ? query : req.body)
        req.dataModel = dataModel
        console.log('dataModel: ', dataModel)
        next()
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const verifyToken = async (req, res, next) => {
    try {
        if (req?.headers?.authorization?.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1]
            jwt.verify(token, process.env.TOKEN_SECRET, (err, decode) => {
                if (err)
                    return res.status(401).json({
                        err: 1,
                        msg: err.message,
                    })
                req.user = decode
                next()
            })
        } else {
            return res.status(401).json({
                err: 1,
                msg: 'Unauthorized. Please login',
            })
        }
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const checkAdmin = async (req, res, next) => {
    try {
        const { role } = req.user
        const roleData = await Role.findOne({ _id: role })
        if (!roleData)
            return res.status(401).json({
                err: 1,
                msg: 'Invalid role',
            })
        if (roleData.roleName !== 'admin')
            return res.status(401).json({
                err: 1,
                msg: 'Please login admin account',
            })
        next()
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    getData,
    checkExist,
    verifyToken,
    checkAdmin,
}
