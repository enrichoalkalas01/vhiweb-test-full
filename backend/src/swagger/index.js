const swaggerUi = require("swagger-ui-express")
const swaggerJsdoc = require("swagger-jsdoc")

// const LanguageDocs = require("./json/language.json")

const baseURL = process.env.BASE_URL || "http://localhost:5000"
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Composync Exclusive Documentation API",
            version: "0.1.0",
        },
        servers: [
            {
                url: `${ baseURL }/api/v1`,
                description: process.env.DATABASE_ENV === "development" ? "Development Server" : "Server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    in: "header",
                    description: "Bearer token dengan waktu kadaluwarsa (expired)",
                },
            },
        },
        paths: {
            // ...SongDocs,
        },
    },
    apis: [
        
    ],
}

const specs = swaggerJsdoc(options)
const serveFiles = swaggerUi.serveFiles(specs, {})
const setup = swaggerUi.setup(specs)

module.exports = {
    serveFiles,
    setup,
}
