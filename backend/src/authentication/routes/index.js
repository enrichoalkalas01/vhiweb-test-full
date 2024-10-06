const Express = require('express')
const Routes = Express.Router()

// Middlewares
const {
    CheckAuthorization,
    VerifyAuthorization,
} = require("../../../middlewares/jwt/Token")

// Controllers
const { RegisterUser, LoginUser } = require("../controllers/authentication")
// const { VerifyAccessToken, CreateAccessToken } = require("../controllers/users/token")

// External Routes

// Routes
Routes.post("/register", RegisterUser)
Routes.post("/login", LoginUser)
// Routes.post("/access-token", CreateAccessToken)
// Routes.get("/verify", [CheckAuthorization, VerifyAuthorization], VerifyAccessToken)

module.exports = Routes