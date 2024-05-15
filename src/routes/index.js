const userRoute = require('./user')
const authRoute = require('./auth')
const { notFound } = require('../middleware/handleError')

const initRoute = (app) => {
    app.use('/api/users', userRoute)
    app.use('/api/auth', authRoute)

    app.use(notFound('Page not found!'))
}

module.exports = initRoute
