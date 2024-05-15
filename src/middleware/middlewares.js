const { validationResult, matchedData } = require('express-validator')
const jwt = require('jsonwebtoken')

const getData = (req, res, next) => {
    const result = validationResult(req)
    if (!result.isEmpty()) {
        return res.status(400).json({
            err: 1,
            errors: result.array(),
        })
    }
    const data = matchedData(req)
    req.data = data
    next()
}

const checkExist = (model, columnName) => async (req, res, next) => {
    try {
        const { data } = req
        const query = {}
        query[columnName] = data[columnName]
        const dataModel = await model.findOne(query)
        req.dataModel = dataModel
        next()
    } catch (error) {
        res.status(500).json({
            err: 1,
            msg: 'Internal server error',
        })
    }
}

const verifyToken = async (req, res, next) => {
    try {
        if (req?.headers?.authorization?.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1]
            jwt.verify(token, process.env.TOKEN_SECRET, (err, decode) => {
                console.log(err)
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
        res.status(500).json({
            err: 1,
            msg: 'Internal server error',
        })
    }
}

module.exports = {
    getData,
    checkExist,
    verifyToken,
}
