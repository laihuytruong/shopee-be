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
    thumbnail: {
        // notEmpty: {
        //     errorMessage: 'Thumbnail cannot be empty',
        // },
    },
}

module.exports = {
    roleValidation,
    categoryValidation,
}
