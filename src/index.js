const express = require('express')
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const dbUrl = require('./database/db')
const initRoute = require('./routes')

const app = express()
const PORT = process.env.PORT || 8081

app.use(
    cors({  
        origin: process.env.REQUEST_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

mongoose
    .connect(dbUrl.url)
    .then(() => {
        console.log('Connected to database')

        initRoute(app)

        app.listen(PORT, () => {
            console.log(`Example app listening on port ${PORT}`)
        })
    })
    .catch((err) => {
        console.log('Failed to database: ', err)
    })
