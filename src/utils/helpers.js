const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')

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
    msg,
    accessToken,
    data,
    page,
    pageSize,
    totalCount
) => {
    if (data) {
        if (page && pageSize && totalCount) {
            const totalPage = Math.ceil(totalCount / pageSize)
            return res.status(statusCode).json({
                err,
                page: +page,
                pageSize: +pageSize,
                totalCount,
                totalPage,
                data,
            })
        }
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
    } else if (accessToken)
        return res.status(statusCode).json({
            err,
            accessToken,
        })
    else
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

const removeVietnameseTones = (str) => {
    str = str.replace(/[\u0300-\u036f]/g, '')
    str = str.replace(/[\u1EA0-\u1EF9]/g, '')

    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A')
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E')
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i')
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I')
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O')
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U')
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y')
    str = str.replace(/đ/g, 'd')
    str = str.replace(/Đ/g, 'D')

    return str
}

const paginationSortSearch = async (model, query, page, limit, sort) => {
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    excludeFields.forEach((el) => delete query[el])

    const matchStage = []

    if (query?.categoryItem) {
        matchStage.push({
            $match: {
                categoryItem: query.categoryItem,
            },
        })
    }

    if (query?.productName) {
        const normalizedProductName = removeVietnameseTones(
            query.productName.toLowerCase()
        )
        matchStage.push({
            $match: {
                productName: { $regex: new RegExp(normalizedProductName, 'i') },
            },
        })
    }

    if (query?.price) {
        const prices = query.price.split(',')
        const minPrice = +prices[0]
        const maxPrice = +prices[1]

        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            matchStage.push({
                $match: {
                    price: { $gte: minPrice, $lte: maxPrice },
                },
            })
        }
    }

    if (query?.brand) {
        const brands = query.brand
            .split(',')
            .map((id) => new mongoose.Types.ObjectId(id))
        matchStage.push({
            $match: {
                brand: { $in: brands },
            },
        })
    }

    if (query?.totalRating) {
        const totalRating = +query.totalRating
        if (!isNaN(totalRating)) {
            matchStage.push({
                $match: {
                    totalRating: { $gte: totalRating },
                },
            })
        }
    }

    const pipeline = [...matchStage]

    if (sort) {
        let sortBy
        if (sort === 'ctime') {
            sortBy = { createdAt: -1 }
        } else if (sort === 'sales') {
            pipeline.push({
                $match: {
                    sold: { $gte: 10 },
                },
            })
        } else {
            sortBy = sort.split(',').reduce((acc, field) => {
                const order = field.startsWith('-') ? -1 : 1
                const cleanField = field.replace('-', '')
                acc[cleanField] = order
                return acc
            }, {})
        }
        if (sortBy) {
            pipeline.push({ $sort: sortBy })
        }
    }

    pipeline.push(
        {
            $lookup: {
                from: 'brands',
                localField: 'brand',
                foreignField: '_id',
                as: 'brandLookup',
            },
        },
        {
            $unwind: {
                path: '$brandLookup',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'categoryitems',
                localField: 'categoryItem',
                foreignField: '_id',
                as: 'categoryItem',
            },
        },
        {
            $unwind: {
                path: '$categoryItem',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'categoryItem.category',
                foreignField: '_id',
                as: 'categoryLookup',
            },
        },
        {
            $addFields: {
                'categoryItem.category': {
                    $arrayElemAt: ['$categoryLookup', 0],
                },
            },
        }
    )

    if (query.fields) {
        const fields = query.fields.split(',').reduce((acc, field) => {
            acc[field.trim()] = 1
            return acc
        }, {})
        pipeline.push({ $project: fields })
    }

    const skip = (+page - 1) * +limit
    pipeline.push({ $skip: skip }, { $limit: +limit })

    const response = await model.aggregate(pipeline)
    const countPipeline = [...matchStage, { $count: 'total' }]
    const countResults = await model.aggregate(countPipeline)
    const count = countResults[0]?.total || 0

    return { response, count }
}

const pipelineCustom = (match, lookups, unwindPaths, addFields) => {
    const pipeline = []

    if (match) {
        pipeline.push({
            $match: match,
        })
    }

    if (lookups) {
        for (const lookup of lookups) {
            pipeline.push({
                $lookup: lookup,
            })
        }
    }

    if (unwindPaths) {
        for (const unwindPath of unwindPaths) {
            pipeline.push({
                $unwind: {
                    path: unwindPath,
                    preserveNullAndEmptyArrays: true,
                },
            })
        }
    }

    if (addFields) {
        for (const field in addFields) {
            if (addFields.hasOwnProperty(field)) {
                pipeline.push({
                    $addFields: {
                        [field]: addFields[field],
                    },
                })
            }
        }
    }

    if (project) {
        pipeline.push({
            $project: project,
        })
    }

    return pipeline
}

// Hàm tìm kiếm theo column name
// const searchByColumn = async (
//     collection,
//     columnName,
//     searchString,
//     page,
//     pageSize
// ) => {
//     const skip = (page - 1) * pageSize
//     const normalizedSearchString = normalizeString(searchString)

//     const pipeline = [
//         {
//             $match: {
//                 [columnName]: {
//                     $regex: normalizedSearchString,
//                     $options: 'i',
//                 },
//             },
//         },
//         { $skip: skip },
//         { $limit: pageSize },
//     ]

//     const results = await collection.aggregate(pipeline)
//     const totalDocuments = await collection.countDocuments({
//         [columnName]: {
//             $regex: normalizedSearchString,
//             $options: 'i',
//         },
//     })
//     const totalPages = Math.ceil(totalDocuments / pageSize)

//     return {
//         results,
//         page,
//         pageSize,
//         totalPages,
//         totalDocuments,
//     }
// }

module.exports = {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    generateSlug,
    responseData,
    getFileNameCloudinary,
    paginationSortSearch,
    // searchByColumn,
    pipelineCustom,
}
