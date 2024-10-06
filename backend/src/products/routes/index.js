const Express = require('express')
const Routes = Express.Router()

// Middlewares
const { CheckAuthorization, VerifyAuthorization } = require("../../../middlewares/jwt/Token")

// Controllers
const ProductControllers = require('../controllers/products')

// External Routes

// Routes
Routes.get("/", ProductControllers.ReadList)
Routes.post("/", [CheckAuthorization, VerifyAuthorization], ProductControllers.Create)
Routes.get("/:id", ProductControllers.ReadDetail)
Routes.put("/:id", ProductControllers.Update)
Routes.delete("/:id", ProductControllers.Delete)

module.exports = Routes