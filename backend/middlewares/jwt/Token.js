require("dotenv").config();
const JWT = require("jsonwebtoken");
const Bcrypt = require("bcrypt");
const Axios = require("axios");

const { CryptoDecrpyter } = require("@v1/utils/tools/generate");

const CheckAuthorization = async (req, res, next) => {
    try {
        if (!req.headers?.authorization) {
            throw {
                name: "Error",
                status: 401,
                message: "Unauthorized!",
            };
        } else {
            let tokenAuth = req.headers?.authorization.split(" ");
            if (tokenAuth[0].toLowerCase() !== "bearer") {
                throw {
                    name: "Error",
                    status: 401,
                    message: "Unauthorized!",
                };
            } else {
                req.TokenAuth = tokenAuth[1];
                next();
            }
        }
    } catch (error) {
        next(error);
    }
};

const VerifyAuthorization = async (req, res, next) => {
    try {
        if (!req.TokenAuth) {
            throw {
                name: "Error",
                status: 401,
                message: "Unauthorized!",
            };
        } else {
            let parsedToken = JWT.verify(req.TokenAuth, process.env.SECRET_KEY);
            if (!parsedToken) {
                throw {
                    name: "Error",
                    status: 401,
                    message: "Unauthorized!",
                };
            } else {
                if (!parsedToken.sub || !parsedToken.usiv || !parsedToken.scrf) {
                    throw {
                        name: "Error",
                        status: 401,
                        message: "Unauthorized!",
                    };
                } else {
                    let checkSourceFrom = await Bcrypt.compare("access_token", parsedToken.scrf);
                    if (!checkSourceFrom) {
                        throw {
                            name: "Error",
                            status: 401,
                            message: "Unauthorized!",
                        };
                    } else {
                        // let config = {
                        //     url: `http://api-dev.composync.id/account/v1/verify/access`,
                        //     // url: `http://127.0.0.1:5005/account/v1/verify/access`,
                        //     method: 'POST',
                        //     headers: {
                        //         'Content-Type': 'application/json',
                        //         'Authorization': `Bearer ${ req.TokenAuth }`
                        //     },
                        //     data: JSON.stringify({
                        //         method: req?.method?.toLowerCase() || null,
                        //         urlPath: req?.baseUrl || null
                        //     })
                        // }

                        // let verifyAccess = await Axios(config)
                        // if ( !verifyAccess?.data?.data?.status ) {
                        //     throw {
                        //         name: 'Error', status: 401,
                        //         message: 'Unauthorized Access!',
                        //     }
                        // } else {
                        let UserData = CryptoDecrpyter({
                            textCode: parsedToken.sub,
                            iv: parsedToken.usiv,
                        });
                        req.UserData = JSON.parse(UserData);
                        next();
                        // }
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};

module.exports = {
    CheckAuthorization,
    VerifyAuthorization,
};
