const jwt = require('jsonwebtoken')
const tokenService = require('../service/token-service')

module.exports = function (req, res, next) {
    if (req.method === 'OPTIONS') {
        next()
    }

    try {
        const token = req.headers.authorization.split(' ')[1]
        // const token = req.cookie

        if (!token) {
            return res.status(403).json({message: 'Пользователь не авторизован 1'})
        }

        const userData = tokenService.validateAccessToken(token)
        if (!userData) {
            return res.status(403).json({message: 'Пользователь не авторизован 2'})
        }

        // const decodedData = jwt.verify(token, 'SECRET_KEY')
        req.user = decodedData
        next()
    } catch (e) {
        return res.status(403).json({message: 'Пользователь не авторизован 3'})
    }
}