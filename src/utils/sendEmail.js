const hbs = require('nodemailer-express-handlebars')
const nodemailer = require('nodemailer')
const path = require('path')

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
})

const handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve(__dirname, '../views/'),
        defaultLayout: false,
    },
    viewPath: path.resolve(__dirname, '../views/'),
    extName: '.hbs',
}

transporter.use('compile', hbs(handlebarOptions))

const sendEmail = async ({ email, template, subject, context }) => {
    const info = await transporter.sendMail({
        from: '"Shopee" <reset-password@shopee.com>',
        to: email,
        subject,
        template,
        context,
    })

    console.log('Message sent: %s', info.messageId)
    return info
}

module.exports = sendEmail
