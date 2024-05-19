const Role = require('../models/role')
const mongoose = require('mongoose')
const { responseData } = require('../utils/helpers')

const getAllRoles = async (req, res) => {
    try {
        const response = await Role.find()
        if (!response) return responseData(res, 404, 1, 'No role found')
        responseData(res, 200, 0, '', response.length, response)
    } catch (error) {
        responseData(res, 500, 1, error.message)
    }
}

const createRole = async (req, res) => {
    try {
        const { roleName, description } = req.data
        const { dataModel } = req
        const role = {
            roleName: roleName.toLowerCase(),
            description,
        }
        if (dataModel) return responseData(res, 400, 1, 'Role does not exist')
        const response = await Role.create(role)

        if (!response) return responseData(res, 400, 1, 'Create role failed')
        responseData(res, 200, 0, '', null, response)
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const updateRole = async (req, res) => {
    try {
        const { roleName, description } = req.data
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id))
            return responseData(res, 400, 1, 'Invalid ID')
        const response = await Role.findByIdAndUpdate(
            _id,
            { roleName: roleName.toLowerCase(), description },
            {
                new: true,
            }
        )
        if (!response) return responseData(res, 400, 1, 'Update role failed')
        responseData(res, 200, 0, 'Update role successfully')
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

const deleteRole = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id))
            return responseData(res, 400, 1, 'Invalid ID')
        const response = await Role.findByIdAndDelete(_id)

        if (!response) return responseData(res, 400, 1, 'No role updated')
        responseData(res, 200, 0, 'Delete role successfully')
    } catch (error) {
        console.log(error)
        responseData(res, 500, 1, error.message)
    }
}

module.exports = {
    getAllRoles,
    createRole,
    updateRole,
    deleteRole,
}
