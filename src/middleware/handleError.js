const notFound = (error) => (req, res, next) => {
    return res.status(404).json({ err: 1, msg: error })
}

module.exports = {
    notFound,
}
