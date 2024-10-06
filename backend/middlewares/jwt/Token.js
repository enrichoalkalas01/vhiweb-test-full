const JWT = require('jsonwebtoken')
const moment = require('moment')
const Bcrypt = require('bcrypt')

const { CryptoEncrypter, CryptoDecrpyter } = require('../../utils/generate')

const CreateTokenJWTCallback = async (params = {
    expired_number: 1,
    expired_type: "day",
    source_from: 'default',
    access: [],
    token_type: 'token',
    data: {},
    id: null,
    firstname: null,
    user_data: null,
}) => {
    const {
        expired_number, expired_type, source_from,
        access, token_type, data, id, firstname, user_data
    } = params

    try {
        let now = new Date()
        let tokenExpired = 0
        let newDateData = null

        if ( expired_type.includes("second") ) {
            newDateData = new Date(now.getTime() + (1000 * expired_number))
        } else if ( expired_type.includes("minute") ) {
            newDateData = new Date(now.getTime() + (1000 * (expired_number * 60) * 60))
        } else if ( expired_type.includes("hour") ) {
            newDateData = new Date(now.getTime() + (1000 * (360 * expired_number)))
        } else if ( expired_type.includes("day") ) {
            newDateData = new Date().setDate(now.getDate() + 1)
        } else if ( expired_type.includes("month") ) {
            let nextMonth = now.getMonth() + expired_number
            let getLastDayDate = new Date(now.getFullYear(), nextMonth + 1, 0)
            newDateData = getLastDayDate
        } else if ( expired_type.includes("year") ) {
            let nextYear = now.getFullYear() + 1
            let getLastYearDate = new Date(nextYear, now.getMonth(), now.getDate())
            newDateData = getLastYearDate
        } else {
            newDateData = new Date(currentDate.getTime() + (1000 * (expired_number * 60) * 60))
        }
        
        let UserData = { id: user_data.id, username: user_data.username, email: user_data.email, type: user_data.type }
        let createCrypter = CryptoEncrypter({ textData: JSON.stringify(UserData) })
        
        tokenExpired = new Date(newDateData).getTime()
        let sourceFromEncrypt = await Bcrypt.hash(token_type, 10)
        let createToken = JWT.sign({
            exp: tokenExpired,
            sub: createCrypter?.encryptedText,
            usiv: createCrypter?.iv,
            scrf: sourceFromEncrypt
        }, process.env.SECRET_KEY, { algorithm: 'HS256' })

        return { status: true, data: createToken, exp: tokenExpired }
    } catch (error) {
        return { status: false, data: null, message: error.message, statusText: error.name, statusCode: error.status }
    }
}

const CreateAccessTokenCallback = async (params = { refresh_token: null }) => {
    const { refresh_token } = params
    try {
        let now = new Date()
        let parsedToken = JWT.verify(refresh_token, process.env.SECRET_KEY)
        
        if ( !parsedToken ) {
            throw {
                name: 'Error', status: 401,
                message: 'Unauthorized!',
            }
        }
        
        let accessTo = await Bcrypt.compare("refresh_token", parsedToken.scrf)
        if ( !accessTo ) {
            throw {
                name: 'Error', status: 401,
                message: 'Unauthorized, Refresh token is not valid!',
            }
        }
        
        let UserData = CryptoDecrpyter({ textCode: parsedToken.sub, iv: parsedToken.usiv })
        let createCrypter = CryptoEncrypter({ textData: JSON.stringify(UserData) })
        
        let tokenExpired = new Date(now.getTime() + (1000 * (360 * 1))).getTime() // 1 hour
        let sourceFromEncrypt = await Bcrypt.hash("access_token", 10)
        let createToken = JWT.sign({
            exp: tokenExpired,
            sub: createCrypter?.encryptedText,
            usiv: createCrypter?.iv,
            scrf: sourceFromEncrypt
        }, process.env.SECRET_KEY, { algorithm: 'HS256' })
        
        return { status: true, data: createToken, exp: tokenExpired }
    } catch (error) {
        return { status: false, data: null, message: error.message, statusText: error.name, statusCode: error.status }
    }
}

const CheckAuthorization = async (req, res, next) => {
    try {
        if ( !req.headers?.authorization ) {
            throw {
                name: 'Error', status: 401,
                message: 'Unauthorized!',
            }
        } else {
            let tokenAuth = req.headers?.authorization.split(" ")
            if ( tokenAuth[0].toLowerCase() !== 'bearer' ) {
                throw {
                    name: 'Error', status: 401,
                    message: 'Unauthorized!',
                }
            } else {
                req.TokenAuth = tokenAuth[1]
                next()
            }
        }
    } catch (error) {
        next(error)
    }
}

const VerifyAuthorization = async (req, res, next) => {
    try {
        if ( !req.TokenAuth ) {
            throw {
                name: 'Error', status: 400,
                message: 'Unauthorized!',
            }
        } else {
            let parsedToken = JWT.verify(req.TokenAuth, process.env.SECRET_KEY)
            if ( !parsedToken ) {
                throw {
                    name: 'Error', status: 400,
                    message: 'Unauthorized!',
                }
            } else {
                if ( !parsedToken.sub || !parsedToken.usiv || !parsedToken.scrf ) {
                    throw {
                        name: 'Error', status: 400,
                        message: 'Unauthorized!',
                    }
                } else {
                    let checkSourceFrom = await Bcrypt.compare('access_token', parsedToken.scrf)
                    if ( !checkSourceFrom ) {
                        throw {
                            name: 'Error', status: 400,
                            message: 'Unauthorized!',
                        }
                    } else {
                        let UserData = CryptoDecrpyter({ textCode: parsedToken.sub, iv: parsedToken.usiv })
                        req.UserData = JSON.parse(UserData)
                        next()
                    }
                }
            }
        }
    } catch (error) {
        next(error)
    }
}

const VerifyAuthorizationFunction = async ({ refresh_token }) => {
    try {
        if ( !refresh_token ) {
            throw {
                name: 'Error', status: 400,
                message: 'Unauthorized!',
            }
        } else {
            let parsedToken = JWT.verify(refresh_token, process.env.SECRET_KEY)
            if ( !parsedToken ) {
                throw {
                    name: 'Error', status: 400,
                    message: 'Unauthorized!',
                }
            } else {
                if ( !parsedToken.sub || !parsedToken.usiv || !parsedToken.scrf ) {
                    throw {
                        name: 'Error', status: 400,
                        message: 'Unauthorized!',
                    }
                } else {
                    let checkSourceFrom = await Bcrypt.compare('refresh_token', parsedToken.scrf)
                    if ( !checkSourceFrom ) {
                        throw {
                            name: 'Error', status: 400,
                            message: 'Unauthorized!',
                        }
                    } else {
                        let UserData = CryptoDecrpyter({ textCode: parsedToken.sub, iv: parsedToken.usiv })
                        return JSON.parse(UserData)
                    }
                }
            }
        }
    } catch (error) {
        return null
    }
}

module.exports = {
    CheckAuthorization,
    CreateTokenJWTCallback,
    CreateAccessTokenCallback,
    VerifyAuthorization,
    VerifyAuthorizationFunction,
}
