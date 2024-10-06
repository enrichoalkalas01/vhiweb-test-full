const express = require("express")
const routes = express.Router()

// Swagger
const { serveFiles, setup } = require("../swagger/index")

// External Routes
const authRoutes = require("../src/authentication/routes/index")
const productRoutes = require("../src/products/routes/index")

routes.use("/authentication", authRoutes)
routes.use("/product", productRoutes)
routes.use("/docs", serveFiles, setup)

module.exports = routes