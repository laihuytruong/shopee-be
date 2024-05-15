const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(10)
    return bcrypt.hashSync(password, salt)
}

const comparePassword = (password, hashPassword) => {
    return bcrypt.compareSync(password, hashPassword)
}

const generateAccessToken = (payload, expiresIn) => {
    return jwt.sign(payload, process.env.TOKEN_SECRET, {
        expiresIn,
    })
}

const generateRefreshToken = (uid) => {
    return jwt.sign({ _id: uid }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    })
}

module.exports = {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
}
