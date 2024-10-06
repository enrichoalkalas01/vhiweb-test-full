const express = require("express")
const app = express()
const cors = require("cors")
const morgan = require("morgan")
const dotenv = require("dotenv")
const helmet = require("helmet")
const path = require("path")
const session = require("express-session")
const healthCheck = require("express-healthcheck")
const cookieParser = require('cookie-parser')

// Setup
dotenv.config({ path: __dirname + '/.env'})

const host = "0.0.0.0"
const port = process.env.PORT || 5000
process.env.PORT = port

// Config Setup
app.use(helmet())
app.use(cors()) 
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))
app.use(morgan('dev'))
app.use(cookieParser())
app.use(session({
    secret: process.env.SecretKey || 'secret no rumpi',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',  // Hanya aktif pada produksi
        sameSite: 'strict',
    }
}))

// Running Server
const server = app.listen(port, host, () => console.log(`Server is running in port : ${ port }`))

// Import & Use Router
const router = require("./routes/index")
app.use('/api/v1', router)

// Run 404 Not Found API Handler
app.use((req, res, next) => {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
})

// Run API Error Handler
const ErrorHandler = require('./middlewares/handlers/ErrorHandlers')
app.use(ErrorHandler.errorHandler)

module.exports = { app, server }