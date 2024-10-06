const Bcrypt = require('bcrypt')
const cryptr = require('cryptr')
const Cryptr = new cryptr(process.env.SECRET_KEY || "vhiweb123!")

const { connectToDatabase: DynamicConnection } = require("../../../models/mongodb/dynamic_connection")
const UserSchema = require("../../../models/mongodb/schema/users")

const { CreateTokenJWTCallback } = require('../../../middlewares/jwt/Token')

const RegisterUser = async (req, res, next) => {
    const {
        username, password, firstname, lastname, fullname,
        phonenumber, email, companyname
    } = req.body

    try {
        let connection = await DynamicConnection(process.env.MongoDBURL)
        let models = await UserSchema(connection)
        let checkExist = await models.findOne({
            $or: [
                { username: { $regex: new RegExp(username, 'i') } },
                { email: { $regex: new RegExp(email, 'i') } },
            ]
        })

        if ( checkExist ) {
            throw {
                name: "Error", status: 400,
                message: "Failed to create user, User is exist!"
            }
        }

        let GeneratePasswordBcrypt = await Bcrypt.hash(password, 10)
        let GeneratePasswordCryptr = Cryptr.encrypt(password)

        if ( !GeneratePasswordBcrypt ) {
            throw {
                name: 'Error', status: 400,
                message: 'Failed to generate password!',
            }
        }

        let DataPassing = {
            "username": username || null,
            "password": [GeneratePasswordBcrypt, GeneratePasswordCryptr] || null,
            "firstname": firstname || null,
            "lastname": lastname || null,
            "fullname": fullname || `${ firstname ? lastname ? `${firstname} ` : firstname : "" }${ lastname }`,
            "phonenumber": phonenumber || null,
            "companyname": companyname || null,
            "email": email || null,
        }
        
        let create = await models.create(DataPassing)

        return res.status(200).json({
            status: 200,
            message: 'Successfull to create data!',
        })
    } catch (error) {
        next(error)
    }
}

const LoginUser = async (req, res, next) => {
    const { username, password } = req.body
    try {
        let connection = await DynamicConnection(process.env.MongoDBURL)
        let models = await UserSchema(connection)
        let getData = await models.findOne({
            $or: [
                { username: { $regex: new RegExp(username, 'i') } },
                { email: { $regex: new RegExp(username, 'i') } },
            ]
        })

        let MatchingPassword = await Bcrypt.compare(password, getData?.password[0])

        if ( !MatchingPassword ) {
            throw {
                name: "Username/Password is wrong!", status: 400,
                message: "Username/Password is wrong!",
            }
        }

        let Datas = getData.toJSON()
        let DataPassing = { };
        for ( let i in Datas ) {
            if (
                i === "username" ||
                i === "firstname" ||
                i === "lastname" ||
                i === "fullname" ||
                i === "phonenumber" ||
                i === "email" ||
                i === "typeUser" ||
                i === "companyname" ||
                i === "_id"
            ) {
                DataPassing[i] = Datas[i]
            }
        }
        
        let createRefreshToken = await CreateTokenJWTCallback({
            expired_number: 7,
            expired_type: "day",
            source_from: "account",
            token_type: "refresh_token",
            firstname: DataPassing?.firstname,
            id: DataPassing?._id,
            user_data: { id: DataPassing?._id, username: DataPassing?.username, email: DataPassing?.email, type: DataPassing?.typeUser },
        })

        let createAccessToken = await CreateTokenJWTCallback({
            expired_number: 1,
            expired_type: "day",
            source_from: "account",
            token_type: "access_token",
            firstname: DataPassing?.firstname,
            id: DataPassing?._id,
            user_data: { id: DataPassing?._id, username: DataPassing?.username, email: DataPassing?.email, type: DataPassing?.typeUser },
        })

        if ( !createRefreshToken.status ) {
            throw {
                name: "Failed to create token!", status: 500,
                message: "Failed to create token!",
            }
        }

        DataPassing["token"] = {
            access_token: createAccessToken.data,
            refresh_token: createRefreshToken.data,
            expired_rf: createRefreshToken.exp,
            expired: createAccessToken.exp
        }

        return res.status(200).json({
            status: 200,
            message: 'Successfull to login!',
            data: DataPassing
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    RegisterUser,
    LoginUser,
}