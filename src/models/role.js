const mongoose = require('mongoose')

const RoleSchema = new mongoose.Schema(
    {
        roleName: {
            type: String,
            require: true,
            enum: ['admin', 'seller', 'user'],
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Role', RoleSchema)
