const jwt = require("jsonwebtoken");
const tokenService = require('../service/token-service')

module.exports = function (roles) {
    return function (req, res, next) {
        if (req.method === 'OPTIONS') {
            next()
        }

        try {

            // const token = req.headers.authorization.split(' ')[1]
            const token = req.cookies.accessToken
            console.log(req.cookies.accessToken)
            if (!token) {
                console.log('ТОКЕН ПРОСРОЧЕН')
            }
            if (!token) {
                return res.status(403).json({message: 'Пользователь не авторизован'})
            }

            const {role: userRoles} = jwt.verify(token, process.env.JWT_SECRET_KEY_ACCESS)
            const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY_ACCESS)

            let hashRole = false
            // userRoles.forEach(r => {
            //     if (roles.includes(r)) {
            //         hashRole = true
            //     }
            // })

            if (roles.includes(userRoles)) {
                hashRole = true
            }
            if (!hashRole) {
                return res.status(403).json({message: 'У вас нет доступа к этому методу'})
            }
            req.user = decodedData

            next()
        } catch (e) {
            return res.status(403).json({message: `Пользователь не авторизован, ошибка ${e}`})
        }
    }
}