const userRoute = require('./user')
const authRoute = require('./auth')
const roleRoute = require('./role')
const productRoute = require('./product')
const categoryRoute = require('./category')
const blogCategoryRoute = require('./blogCategory')
const blogRoute = require('./blog')
const brandRoute = require('./brand')
const couponRoute = require('./coupon')
const orderRoute = require('./order')
const { notFound } = require('../middleware/handleError')

const initRoute = (app) => {
    app.use('/api/order', orderRoute)
    app.use('/api/coupon', couponRoute)
    app.use('/api/brand', brandRoute)
    app.use('/api/blog', blogRoute)
    app.use('/api/blog-category', blogCategoryRoute)
    app.use('/api/categories', categoryRoute)
    app.use('/api/products', productRoute)
    app.use('/api/users', userRoute)
    app.use('/api/role', roleRoute)
    app.use('/api/auth', authRoute)

    app.use(notFound('Page not found!'))
}

module.exports = initRoute
