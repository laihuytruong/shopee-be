const userRoute = require('./user')
const authRoute = require('./auth')
const roleRoute = require('./role')
const productRoute = require('./product')
const categoryRoute = require('./category')
const { notFound } = require('../middleware/handleError')

const initRoute = (app) => {
    app.use('/api/categories', categoryRoute)
    app.use('/api/products', productRoute)
    app.use('/api/users', userRoute)
    app.use('/api/role', roleRoute)
    app.use('/api/auth', authRoute)

    app.use(notFound('Page not found!'))
}

module.exports = initRoute
