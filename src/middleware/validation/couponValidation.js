const moment = require('moment')

const couponValidation = {
    couponName: {
        notEmpty: {
            errorMessage: 'Coupon name cannot be empty',
        },
    },
    discount: {
        notEmpty: {
            errorMessage: 'Discount cannot be empty',
        },
    },
    expireDate: {
        custom: {
            options: (value) => {
                if (value) {
                    const parts = value.split('/')
                    const day = parts[0].padStart(2, '0')
                    const month = parts[1].padStart(2, '0')
                    const year = parts[2]
                    const formattedDate = `${day}/${month}/${year}`
                    const birth = moment(formattedDate, 'DD/MM/YYYY', true)
                    if (!birth) {
                        throw new Error(
                            'Expire date must be a dd/mm/yyyy format'
                        )
                    }
                    if (!birth.isValid()) {
                        throw new Error('Invalid Expire date')
                    }
                    return true
                }
            },
        },
    },
}

module.exports = {
    couponValidation,
}
