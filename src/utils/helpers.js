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

const convertVietnameseToEnglish = (vietnameseString) => {
    const normalizedString = vietnameseString.toLowerCase().normalize('NFD')
    return normalizedString.replace(/[\u0300-\u036f]/g, '-')
}

const getFileNameCloudinary = (image) => {
    const arr = image.split('/')
    const filename =
        arr[arr.length - 2] + '/' + arr[arr.length - 1].split('.')[0]
    return filename
}

module.exports = {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    convertVietnameseToEnglish,
    getFileNameCloudinary
}
