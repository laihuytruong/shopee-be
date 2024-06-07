const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const categoryItem = require('../models/categoryItem')

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

const responseData = (
    res,
    statusCode,
    err,
    msg = '',
    count,
    data = null,
    accessToken
) => {
    if (data) {
        if (count)
            return res.status(statusCode).json({
                err,
                count,
                data,
            })
        if (msg && accessToken)
            return res.status(statusCode).json({
                err,
                msg,
                accessToken,
                data,
            })
        if (msg && !accessToken)
            return res.status(statusCode).json({
                err,
                msg,
                data,
            })
        return res.status(statusCode).json({
            err,
            data,
        })
    }
    if (accessToken)
        return res.status(statusCode).json({
            err,
            accessToken,
        })
    return res.status(statusCode).json({
        err,
        msg,
    })
}

const generateSlug = (vietnameseString) => {
    const map = {
        Đ: 'd',
        đ: 'd',
        À: 'A',
        Á: 'A',
        Â: 'A',
        Ã: 'A',
        È: 'E',
        É: 'E',
        Ê: 'E',
        Ì: 'I',
        Í: 'I',
        Ò: 'O',
        Ó: 'O',
        Ô: 'O',
        Õ: 'O',
        Ù: 'U',
        Ú: 'U',
        Ý: 'Y',
        à: 'a',
        á: 'a',
        â: 'a',
        ã: 'a',
        è: 'e',
        é: 'e',
        ê: 'e',
        ì: 'i',
        í: 'i',
        ò: 'o',
        ó: 'o',
        ô: 'o',
        õ: 'o',
        ù: 'u',
        ú: 'u',
        ý: 'y',
        Ă: 'A',
        ă: 'a',
        Đ: 'D',
        đ: 'd',
        Ĩ: 'I',
        ĩ: 'i',
        Ũ: 'U',
        ũ: 'u',
        Ơ: 'O',
        ơ: 'o',
        Ư: 'U',
        ư: 'u',
        Ạ: 'A',
        ạ: 'a',
        Ả: 'A',
        ả: 'a',
        Ấ: 'A',
        ấ: 'a',
        Ầ: 'A',
        ầ: 'a',
        Ẩ: 'A',
        ẩ: 'a',
        Ẫ: 'A',
        ẫ: 'a',
        Ậ: 'A',
        ậ: 'a',
        Ắ: 'A',
        ắ: 'a',
        Ằ: 'A',
        ằ: 'a',
        Ẳ: 'A',
        ẳ: 'a',
        Ẵ: 'A',
        ẵ: 'a',
        Ặ: 'A',
        ặ: 'a',
        Ẹ: 'E',
        ẹ: 'e',
        Ẻ: 'E',
        ẻ: 'e',
        Ẽ: 'E',
        ẽ: 'e',
        Ế: 'E',
        ế: 'e',
        Ề: 'E',
        ề: 'e',
        Ể: 'E',
        ể: 'e',
        Ễ: 'E',
        ễ: 'e',
        Ệ: 'E',
        ệ: 'e',
        Ỉ: 'I',
        ỉ: 'i',
        Ị: 'I',
        ị: 'i',
        Ọ: 'O',
        ọ: 'o',
        Ỏ: 'O',
        ỏ: 'o',
        Ố: 'O',
        ố: 'o',
        Ồ: 'O',
        ồ: 'o',
        Ổ: 'O',
        ổ: 'o',
        Ỗ: 'O',
        ỗ: 'o',
        Ộ: 'O',
        ộ: 'o',
        Ớ: 'O',
        ớ: 'o',
        Ờ: 'O',
        ờ: 'o',
        Ở: 'O',
        ở: 'o',
        Ỡ: 'O',
        ỡ: 'o',
        Ợ: 'O',
        ợ: 'o',
        Ụ: 'U',
        ụ: 'u',
        Ủ: 'U',
        ủ: 'u',
        Ứ: 'U',
        ứ: 'u',
        Ừ: 'U',
        ừ: 'u',
        Ử: 'U',
        ử: 'u',
        Ữ: 'U',
        ữ: 'u',
        Ự: 'U',
        ự: 'u',
        Ỳ: 'Y',
        ỳ: 'y',
        Ỵ: 'Y',
        ỵ: 'y',
        Ỷ: 'Y',
        ỷ: 'y',
        Ỹ: 'Y',
        ỹ: 'y',
    }

    const noAccent = vietnameseString
        .split('')
        .map((char) => map[char] || char)
        .join('')

    const noSpecialChars = noAccent.replace(/[^a-zA-Z0-9\s]/g, ' ')

    const withHyphens = noSpecialChars.replace(/\s+/g, '-')

    const trimmedResult = withHyphens.replace(/^-+|-+$/g, '')

    return trimmedResult
}

const getFileNameCloudinary = (image) => {
    const arr = image.split('/')
    const filename =
        arr[arr.length - 2] + '/' + arr[arr.length - 1].split('.')[0]
    return filename
}

const paginationSortSearch = async (model, query, page, limit, sort) => {
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    excludeFields.forEach((el) => delete query[el])
    let queryString = JSON.stringify(query)
    queryString = queryString.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (matchedEl) => `$${matchedEl}`
    )
    const formattedQueries = JSON.parse(queryString)

    // Filtering by productName
    console.log(query.productName)
    if (query?.productName)
        // const regexPattern = query.productName.split('').join('.*');
        formattedQueries.productName = {
            $regex: query.productName,
            $options: 'i',
        }

    // Filtering by price range
    if (query?.price) {
        const prices = query.price.split(',')
        if (prices[0] !== '' && prices[1] !== '')
            formattedQueries.price = {
                $gte: +prices[0],
                $lte: +prices[1],
            }
    }

    // Filtering by brand
    if (query?.brand) {
        const brand = query.brand.split(',').map((item) => {
            return new mongoose.Types.ObjectId(item)
        })
        formattedQueries.brand = {
            $in: brand,
        }
    }

    // Filtering by star rating
    if (query?.totalRating) {
        const rating = +query.totalRating
        if (rating === 5) {
            formattedQueries.totalRating = {
                $eq: 5,
            }
        } else if (rating > 1 && rating < 5) {
            formattedQueries.totalRating = {
                $gte: rating,
            }
        }
    }

    let queryCommand = model
        .find(formattedQueries)
        .populate({
            path: 'categoryItem',
            populate: {
                path: 'category',
                model: 'Category',
            },
        })
        .populate('brand')

    // Sorting
    if (sort) {
        let sortBy
        if (sort === 'pop') {
            model.find(formattedQueries)
        } else if (sort === 'ctime') {
            sortBy = '-createdAt'
        } else if (sort === 'sales') {
            formattedQueries.sold = {
                $gte: 10,
            }
            queryCommand = model.find(formattedQueries)
        } else {
            sortBy = sort
                .split(',')
                .map((item) => item.trim())
                .join(' ')
        }
        if (sortBy) {
            queryCommand = queryCommand.sort(sortBy)
        }
    }
    // Fields limiting
    if (query.fields) {
        const fields = query.fields
            .split(',')
            .map((item) => item.trim())
            .join(' ')
        queryCommand = queryCommand.select(fields)
    }

    // Pagination
    const skip = (+page - 1) * +limit
    queryCommand.skip(skip).limit(+limit)

    const response = await queryCommand
    const count = await model.find(formattedQueries).countDocuments()
    return { response, count }
}

module.exports = {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    generateSlug,
    responseData,
    getFileNameCloudinary,
    paginationSortSearch,
}
