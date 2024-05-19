const roleValidation = {
    roleName: {
        notEmpty: {
            errorMessage: 'Role name cannot be empty',
        },
    },
    description: {},
}

const categoryValidation = {
    categoryName: {
        notEmpty: {
            errorMessage: 'Category name cannot be empty',
        },
    },
    thumbnail: {},
}

module.exports = {
    roleValidation,
    categoryValidation,
}
