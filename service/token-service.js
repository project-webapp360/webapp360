const jwt = require('jsonwebtoken')
const tokenModel = require('../models/token')

class TokenService {

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_SECRET_KEY_ACCESS)
            return userData
        } catch (e) {
            return null
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_SECRET_KEY_REFRESH)
            return userData
        } catch (e) {
            return null
        }
    }


    generateToken(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY_ACCESS, {expiresIn: '30m'})
        const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_KEY_REFRESH, {expiresIn: '30d'})
        return {
            accessToken, refreshToken
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne({user: userId})
        if (tokenData) {
            tokenData.refreshToken = refreshToken
            return tokenData.save()
        }
        // const token = new tokenModel.create({user: userId, refreshToken})
        const token = new tokenModel({
            user: userId,
            refreshToken
        })
        return token
    }

    async removeToken(refreshToken) {
        const tokenData = await tokenModel.deleteOne({refreshToken})
        return tokenData
    }

    async findToken(refreshToken) {
        const tokenData = await tokenModel.findOne({refreshToken})
        return tokenData
    }
}

module.exports = new TokenService()