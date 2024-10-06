const moment = require("moment")

module.exports = {
    errorHandler(err, req, res, next) {
        console.error(err)

        let statusCode = 500
        let errorMessageCustom = err.message // || err?.errors[0]?.message

        if (err.status) {
            statusCode = err.status
        }

        res.status(statusCode)

        let errPassing = {
            status: statusCode,
            statusCode: statusCode,
            statusText: `${errorMessageCustom} | ${err.name}`,
            message: err.message || "Internal Server Error",
            fetchDate: moment().format("YYYY-MM-DD HH:mm:ss"),
        }

        return res.status(statusCode).json(errPassing)
    },
}
