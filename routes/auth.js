const {Router} = require('express')
const User = require('../models/user')
const Role = require('../models/role')
const tokenModel = require('../models/token')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const tokenService = require('../service/token-service')
const UserDto = require('../dto/user-dto')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const router = Router()

router.get('/login', (req, res) => {
    res.render('auth/login')
})

//Авторизация
router.post('/login', async (req, res) => {
    try {

        const {email, password} = req.body
        const user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({message: `Пользователь ${email} не найден`})
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            return res.status(400).json({message: `Введен неверный пароль`})
        }

        const userDto = new UserDto(user)
        const tokens = tokenService.generateToken({...userDto})
        const token = await tokenService.saveToken(userDto.id, tokens.refreshToken)
        await token.save()
        res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        res.cookie('accessToken', tokens.accessToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        const result = {
            ...tokens,
            user: userDto
        }

        // function generateToken (id, role) {
        //     const payload = {
        //         id, role
        //     }
        //     return jwt.sign(payload, 'SECRET_KEY',{expiresIn: '24h'})
        // }

        // const token = generateToken(user._id, user.role)
        // const {id: iddd} = jwt.verify(token, 'SECRET_KEY')
        // console.log(iddd)

        // return res.json(result)
        res.redirect('/app/main')
    } catch (e) {
        console.log(e)
    }
})

//Регистрация
router.post('/register', async (req, res) => {
    try {
        const {email, password, role} = req.body
        console.log(email, password)
        const candidate = await User.findOne({email})
        if (candidate) {
            return res.status(400).json({message: 'Такой пользователь уже существует'})
        }

        const hashPassword = await bcrypt.hash(password, 7)
        const user = new User({
            email,
            password: hashPassword,
            role
            // role: userRole.value
        })
        await user.save()
        const userAgain = await User.findOne({email})
        const userDto = new UserDto(userAgain)
        const tokens = tokenService.generateToken({...userDto})
        const token = await tokenService.saveToken(userDto.id, tokens.refreshToken)
        await token.save()
        // const userRole = await Role.findOne({value: 'USER'})

        res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        const result = {
            ...tokens,
            user: userDto
        }
        return res.json(result)


    } catch (e) {
        console.log(e)
    }
})

//Разлогинивание
router.post('/logout', async (req, res) => {
    try {
        const {refreshToken} = req.cookies
        const token = await tokenModel.deleteOne({refreshToken})
        res.clearCookie('refreshToken')
        return res.json(token)
    } catch (e) {
        console.log(e)
    }
})

//Обновление токена
router.get('/refresh', async (req, res) => {
    try {
        const {refreshToken} = req.cookies
        if (!refreshToken) {
            return res.status(400).json({message: `Неавторизованный пользователь`})
        }
        const userData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await tokenService.findToken(refreshToken)

        if (!userData || !tokenFromDb) {
            return res.status(400).json({message: `Неавторизованный пользователь`})
        }
        const user = await User.findById(userData.id)
        const userDto = new UserDto(user)
        const tokens = tokenService.generateToken({...userDto})

        const token = await tokenService.saveToken(userDto.id, tokens.refreshToken)
        await token.save()

        res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        res.cookie('accessToken', tokens.accessToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        const result = {
            ...tokens,
            user: userDto
        }
        return res.json(result)
    } catch (e) {
        console.log(e)
    }
})

//Получение списка всех пользователей в формате json
router.get('/users', roleMiddleware(['ADMIN']), async (req, res) => {
    try {

        const users = await User.find()
        res.json(req.user)

        // const hashPassword = await bcrypt.hash('password', 7)
        // const role = await Role.findOne({value: 'USER'})
        // const user = new User({
        //     username: 'user',
        //     password: hashPassword,
        //     roles: [
        //         role.value
        //     ]
        // })
        //
        // await user.save()

    } catch (e) {
        console.log(e)
    }
})

router.get('/create', async (req, res) => {
    try {
        const role = new Role({
            value: 'MANAGER'
        })
        await role.save()
    } catch (e) {
        console.log(e)
    }
})

module.exports = router