const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
})

const sendEmail = async ({ email, html }) => {
    const info = await transporter.sendMail({
        from: '"Shopee" <reset-password@shopee.com>',
        to: email,
        subject: 'Fotgot password',
        html: html,
    })

    console.log('Message sent: %s', info.messageId)
    return info
}

module.exports = sendEmail
