const Role = require('../models/role')
const mongoose = require('mongoose')

const getAllRoles = async (req, res) => {
    try {
        const users = await Role.find()
        if (!users)
            return res.status(404).json({
                err: 1,
                msg: 'No role found',
            })
        res.status(200).json({
            err: 0,
            users: {
                count: users.length,
                data: users,
            },
        })
    } catch (error) {
        res.status(500).json({
            err: 1,
            msg: error.message,
        })
    }
}

const createRole = async (req, res) => {
    try {
        const { roleName, description } = req.data
        const { dataModel } = req
        const role = new Role({
            roleName: roleName.toLowerCase(),
            description,
        })
        if (dataModel)
            return res.status(400).json({
                err: 1,
                msg: 'Role already exist',
            })
        const newRole = await role.save()
        res.status(201).json({
            err: newRole ? 0 : 1,
            msg: newRole ? 'Create role successfully' : 'Create role failed',
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            err: 1,
            msg: error.message,
        })
    }
}

const updateRole = async (req, res) => {
    try {
        const { roleName, description } = req.data
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id))
            return res.status(400).json({
                err: 1,
                msg: 'Invalid ID',
            })
        const updateRole = await Role.findByIdAndUpdate(
            _id,
            { roleName: roleName.toLowerCase(), description },
            {
                new: true,
            }
        )
        res.status(updateRole ? 200 : 400).json({
            err: updateRole ? 0 : 1,
            msg: updateRole ? 'Update role successfully' : 'No role updated',
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            err: 1,
            msg: error.message,
        })
    }
}

const deleteRole = async (req, res) => {
    try {
        const { _id } = req.params
        if (!_id || !mongoose.Types.ObjectId.isValid(_id))
            return res.status(400).json({
                err: 1,
                msg: 'Invalid ID',
            })
        const deleteRole = await Role.findByIdAndDelete(_id)
        res.status(deleteRole ? 200 : 400).json({
            err: deleteRole ? 0 : 1,
            msg: deleteRole ? 'Delete role successfully' : 'No role updated',
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            err: 1,
            msg: error.message,
        })
    }
}

module.exports = {
    getAllRoles,
    createRole,
    updateRole,
    deleteRole,
}
