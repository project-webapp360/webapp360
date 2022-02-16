const User = require('../models/user')

module.exports = async function (req, res ,next) {
    if (!req.user) {
        return next()
    }

    req.user = await User.findById(req.user._id)
    next()
}