const {Router} = require('express')
// const roles = require('../config/roles')
const jwt = require('jsonwebtoken')
const router = Router()

router.get('/main', (req, res) => {
    // const token = req.headers.authorization.split(' ')[1]
    // const {role: userRole} = jwt.verify(token, 'SECRET_KEY')

    const token = req.cookies.accessToken
    if (!token) {
        return res.status(403).json({message: 'Пользователь не авторизован'})
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY_ACCESS)

    res.render('app/main', {
        layout: 'app',
        user: decodedData,
        // userRole: userRole
    })
})

module.exports = router