const mongoose = require('mongoose')

const RoleSchema = new mongoose.Schema(
    {
        roleName: {
            type: String,
            require: true,
            enum: ['admin', 'root', 'user'],
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
