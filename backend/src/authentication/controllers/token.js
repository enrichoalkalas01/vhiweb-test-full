const Bcrypt = require('bcrypt')
const cryptr = require('cryptr')
const Cryptr = new cryptr(process.env.SECRET_KEY || "massive-music-secrets!")

const DynamicConnection = require("../../models/MongoDB/dynamic_connection")
const UserSchema = require("../../models/MongoDB/schema/users")

const { CreateTokenJWTCallback } = require('../../middlewares/jwt/Token')
const { VerifyAuthorizationFunction } = require('../../middlewares/jwt/Token')

const VerifyAccessToken = async (req, res, next) => {
    try {
        let DataPassing = null
        
        DataPassing = {
            type: req.UserData.type,
            username: req.UserData.username,
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

const CreateAccessToken = async (req, res, next) => {
    const { rft } = req.body
    try {
        let checkToken = await VerifyAuthorizationFunction({ refresh_token: rft })
        if ( !checkToken ) {
            throw {
                name: "Error!", status: 400,
                message: "Unauthorized!"
            }
        }

        let connection = await DynamicConnection(process.env.MongoDBURL)
        let models = await UserSchema(connection)
        let getData = await models.findOne({
            _id: checkToken?.id,
            email: checkToken?.email,
            username: checkToken?.username,
        })

        let DataPassing = { };
        for ( let i in getData ) {
            if (
                i === "username" ||
                i === "firstname" ||
                i === "lastname" ||
                i === "fullname" ||
                i === "phonenumber" ||
                i === "email" ||
                i === "typeUser" ||
                i === "companyName" ||
                i === "_id"
            ) {
                DataPassing[i] = getData[i]
            }
        }

        let createAccessToken = await CreateTokenJWTCallback({
            expired_number: 1,
            expired_type: "day",
            source_from: "account",
            token_type: "access_token",
            firstname: DataPassing?.firstname,
            id: DataPassing?._id,
            user_data: { id: DataPassing?._id, username: DataPassing?.username, email: DataPassing?.email, type: DataPassing?.typeUser },
        })

        if ( !createAccessToken?.status ) {
            throw {
                name: "Error!", status: 400,
                message: "Failed to create token!"
            }
        }

        let Pass = {
            access_token: createAccessToken?.data,
            expired: createAccessToken?.exp
        }

        return res.status(200).json({
            status: 200,
            message: 'Successfull to login!',
            data: Pass || null
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    VerifyAccessToken,
    CreateAccessToken,
}