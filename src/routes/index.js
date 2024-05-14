const userRoute = require('./userRoute')

const initRoute = (app) => {
  app.use('/api/user', userRoute)

  app.use('/', (req, res) => {
    res.send('Hello world!')
  })
}

module.exports = initRoute