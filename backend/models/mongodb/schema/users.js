const Mongoose = require('mongoose')

var Schema = new Mongoose.Schema(
    {
        username: { type: String, required: true, default: null, unique: true, },
        password: { type: Array, required: true, default: null, unique: false, },
        firstname: { type: String, required: false, default: null, unique: false, },
        lastname: { type: String, required: false, default: null, unique: false, },
        fullname: { type: String, required: false, default: null, unique: true, },
        companyname: { type: String, required: false, default: null, unique: false, },
        phonenumber: { type: String, required: false, default: null, unique: true, },
        email: { type: String, required: true, default: null, unique: true, },

        typeUser: { type: String, required: false, default: "user" }, // user, admin, super admin
        isActive: { type: Boolean, required: false, default: false },
        approved: { type: Boolean, required: false, default: false },

        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    }
)

module.exports = (conn) => conn.model('User', Schema)