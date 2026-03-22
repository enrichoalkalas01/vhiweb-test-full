const express = require("express")
const app = express()
const cors = require("cors")
const morgan = require("morgan")
const dotenv = require("dotenv")
const helmet = require("helmet")
const path = require("path")
const fs = require("fs")
const session = require("express-session")
const cookieParser = require('cookie-parser')

// Setup
dotenv.config({ path: __dirname + '/.env'})

const host = "0.0.0.0"
const port = process.env.PORT || 5000
process.env.PORT = port

const publicDir = path.join(__dirname, 'public')
const hasFrontend = fs.existsSync(path.join(publicDir, 'index.html'))

// Config Setup
// Disable CSP so Next.js inline scripts are not blocked when serving static files
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Serve Next.js static export — try .html extension for extensionless requests
app.use(express.static(publicDir, { extensions: ['html'] }))

app.use(morgan('dev'))
app.use(cookieParser())
app.use(session({
    secret: process.env.SecretKey || 'secret no rumpi',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    }
}))

// Running Server
const server = app.listen(port, host, () => {
    console.log(`Server is running on port : ${port}`)
    if (hasFrontend) {
        console.log(`Frontend served at http://localhost:${port}`)
    }
})

// Import & Use Router
const router = require("./routes/index")
app.use('/api/v1', router)

// ── SPA Fallback for Next.js client-side routes ──────────────────────────────
// /products/:id → serve the static shell built from generateStaticParams({id:'__id__'})
// The client-side useParams() reads the real ID from the URL and fetches data.
if (hasFrontend) {
    const productShell = path.join(publicDir, 'products', '__id__.html')

    app.get('/products/:id', (req, res, next) => {
        if (fs.existsSync(productShell)) {
            return res.sendFile(productShell)
        }
        next()
    })

    // Catch-all: any unmatched non-API route serves the Next.js index shell
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) return next()
        const indexFile = path.join(publicDir, 'index.html')
        if (fs.existsSync(indexFile)) {
            return res.sendFile(indexFile)
        }
        next()
    })
}

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
