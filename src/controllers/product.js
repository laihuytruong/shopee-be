const mongoose = require('mongoose')
const Product = require('../models/product')

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
        if (!products)
            return res.status(404).json({
                err: 1,
                msg: 'No product found',
            })
        res.status(200).json({
            err: 0,
            products: {
                count: products.length,
                data: products,
            },
        })
    } catch (error) {
        res.status(500).json({
            err: 1,
            msg: error.message,
        })
    }
}

const getOneProduct = async (req, res) => {
    try {
        const { _id } = req.params
        if (!mongoose.Types.ObjectId.isValid(_id))
            return res.status(400).json({
                err: 1,
                msg: 'Invalid product id',
            })
        const product = await Product.findById(new mongoose.Types.ObjectId(_id))
        if (!product)
            return res.status(404).json({
                err: 1,
                msg: 'No product found',
            })
        res.status(200).json({
            err: 0,
            product,
        })
    } catch (error) {
        res.status(500).json({
            err: 1,
            msg: error.message,
        })
    }
}

const createProduct = async (req, res) => {
    try {
        const { data } = req
        return res.status(201).json({
            err: 0,
            data,
        })
    } catch (error) {
        res.status(500).json({
            err: 1,
            msg: error.message,
        })
    }
}

module.exports = {
    getAllProducts,
    getOneProduct,
    createProduct,
}
