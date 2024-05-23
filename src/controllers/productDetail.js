const mongoose = require('mongoose')
const ProductDetail = require('../models/productDetail')
const Product = require('../models/product')
const {
    generateSlug,
    responseData,
    getFileNameCloudinary,
} = require('../utils/helpers')
const cloudinary = require('cloudinary').v2

const getProductDetail = async (req, res) => {
    try {
        const { _id } = req.params
        if (!mongoose.Types.ObjectId.isValid(_id))
            return responseData(res, 400, 1, 'Invalid product detail id')
        const response = await ProductDetail.findById(
            new mongoose.Types.ObjectId(_id)
        ).populate('product', 'image')
        if (!response)
            return responseData(res, 404, 1, 'No product detail found')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createProductDetail = async (req, res) => {
    try {
        const { data } = req
        const product = await Product.findById(
            new mongoose.Types.ObjectId(data.product)
        )
        console.log(req.file)
        if (!req.file) return responseData(res, 400, 1, 'Image cannot be empty')
        if (!product) {
            return responseData(res, 404, 1, 'Product not found')
        }
        const response = await ProductDetail.create({
            ...data,
            slug: generateSlug(data.productDetailName),
            product: product._id,
            image: req.file.path,
        })
        if (!response) {
            cloudinary.uploader.destroy(req.file.filename)
            return responseData(res, 400, 1, 'Product detail created failed')
        }
        responseData(res, 201, 0, '', null, response)
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
        if (req.file) cloudinary.uploader.destroy(req.file.filename)
    }
}

const updateProductDetail = async (req, res) => {
    try {
        const {
            data,
            params: { _id },
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid product id')
        }
        if (!req.file) return responseData(res, 400, 1, 'Image cannot be empty')
        const product = await Product.findById(
            new mongoose.Types.ObjectId(data.product)
        )
        if (!product) {
            return responseData(res, 404, 1, 'Product not found')
        }

        const response = await ProductDetail.findByIdAndUpdate(
            _id,
            {
                ...data,
                slug: generateSlug(data.productDetailName),
                product: product._id,
                image: req.file.path,
            },
            {
                new: true,
            }
        )
        console.log(response)
        if (!response) {
            cloudinary.uploader.destroy(req.file.filename)
            return responseData(res, 400, 1, 'No product updated')
        }
        responseData(res, 200, 0, 'Product updated successfully')
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
        if (req.file) cloudinary.uploader.destroy(req.file.filename)
    }
}

const deleteProductDetail = async (req, res) => {
    try {
        const {
            params: { _id },
        } = req
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }

        const response = await ProductDetail.findByIdAndDelete(_id)
        if (!response) return responseData(res, 400, 1, 'No product deleted')
        cloudinary.uploader.destroy(getFileNameCloudinary(response.image))
        responseData(
            res,
            201,
            0,
            `Product with productDetailName ${response.productDetailName} deleted successfully`
        )
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const uploadImagesProduct = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return responseData(res, 400, 1, 'Invalid ID')
        }
        console.log(req.files)
        if (!req.files) return responseData(res, 400, 1, 'No image upload')
        const response = await Product.findByIdAndUpdate(
            _id,
            {
                $push: {
                    image: { $each: req.files.map((image) => image.path) },
                },
            },
            { new: true }
        )
        console.log(response)
        if (!response) return responseData(res, 400, 1, 'Upload image failed')
        responseData(res, 200, 1, 'Upload image successfully', null, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    getProductDetail,
    createProductDetail,
    updateProductDetail,
    deleteProductDetail,
}
