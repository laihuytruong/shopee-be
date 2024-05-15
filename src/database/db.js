const mongoose = require('mongoose')

const connectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_URL)
        if (conn.connection.readyState === 1) {
            console.log('DB connected successfully')
        } else {
            console.log('DB connecting')
        }
    } catch (error) {
        console.log('DB connected unsuccessfully')
        throw new Error(error)
    }
}

module.exports = connectDb
