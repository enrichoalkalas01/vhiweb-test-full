const Mongoose = require('mongoose')

var Schema = new Mongoose.Schema(
    {
        title: { type: String, required: true, default: null },
        slug: { type: String, required: false, default: null },
        description: { type: String, required: false, default: null },
        price: { type: String, required: false, default: null },
        stock: { type: Object, required: false, default: null },
        relation: { type: Object, required: false, default: null },

        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    }
)

module.exports = (conn) => conn.model('Product', Schema)