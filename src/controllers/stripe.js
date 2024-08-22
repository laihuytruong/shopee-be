const { responseData } = require('../utils/helpers')
const stripe = require('stripe')(process.env.STRIPE_KEY)
const Order = require('../models/order')

const createCheckoutSession = async (req, res) => {
    try {
        const { products } = req.body
        const { _id } = req.user

        const order = new Order({
            products,
            status: 'Waiting Delivering',
            orderBy: _id,
        })
        await order.save()

        const lineItems = products.map((product) => ({
            price_data: {
                currency: 'vnd',
                unit_amount: product.productDetail.price + 15000,
                product_data: {
                    name: product.productDetail.product.productName,
                    images: [product.productDetail.image],
                },
            },
            quantity: product.quantity,
        }))
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: process.env.REQUEST_URL + '/payment/success',
            cancel_url: process.env.REQUEST_URL + '/payment/error',
        })
        responseData(res, 200, 0, '', null, { id: session.id })
    } catch (error) {
        console.error('error: ', error)
        responseData(res, 500, 1, error.message)
    }
}

const getTotalTransactionsAndAmount = async (req, res) => {
    try {
        const charges = await stripe.charges.list({
            limit: 100,
        })

        const totalTransactions = charges.data.length
        const totalAmount = charges.data.reduce((sum, charge) => {
            return sum + charge.amount
        }, 0)
        responseData(res, 200, 0, totalAmount)
    } catch (error) {
        console.error('Error retrieving transactions and amount:', error)
    }
}

module.exports = {
    createCheckoutSession,
    getTotalTransactionsAndAmount,
}
