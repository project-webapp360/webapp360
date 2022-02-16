const {Router} = require('express')
const jwt = require('jsonwebtoken')
const router = Router()
const tokenService = require('../service/token-service')
const roleMiddleware = require('../middleware/roleMiddleware')

router.get('/registration', roleMiddleware(['ADMIN']), async (req, res) => {

    const token = req.cookies.accessToken
    if (!token) {
        return res.status(403).json({message: 'Пользователь не авторизован'})
    }
    // const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY_ACCESS)
    const decodedData = tokenService.validateAccessToken(token)

    res.render('app/registration', {
        layout: 'app',
        user: decodedData,
        isRegistration: true
    })
})

module.exports = router