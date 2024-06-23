const { responseData } = require('../utils/helpers')
const stripe = require('stripe')(process.env.STRIPE_KEY)

const createCheckoutSession = async (req, res) => {
    try {
        const { products } = req.body
        console.log('req.body: ', req.body.products)

        const lineItems = products.map((product) => ({
            price_data: {
                currency: 'vnd',
                unit_amount: product.productDetail.price,
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
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    createCheckoutSession,
}
