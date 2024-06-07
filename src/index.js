const express = require('express')
const cors = require('cors')
require('dotenv').config()
const connectDb = require('./database/db')
const initRoute = require('./routes')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const app = express()
const PORT = process.env.PORT || 8081

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(bodyParser.json())

app.use(
    cors({
        origin: process.env.REQUEST_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
)

connectDb()

initRoute(app)

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})
