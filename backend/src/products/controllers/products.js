const Mongoose = require("mongoose")
const { ObjectId } = Mongoose.Types

const { connectToDatabase: DynamicConnection } = require("../../../models/mongodb/dynamic_connection")
const ProductSchema = require("../../../models/mongodb/schema/products")
const UserSchema = require("../../../models/mongodb/schema/users")

const ReadList = async (req, res, next) => {
    const {
        query,
        page,
        size,
        sort_by,
        order_by,
    } = req.query

    try {
        // Set Up Connection
        const connection = await DynamicConnection(process.env.MongoDBURL)
        const models = await ProductSchema(connection)
        const totalData = await models.countDocuments({})

        // Set up pagination and sorting
        const pageNumber = Number(page) || 1
        const pageSize = Number(size) || 5
        const skip = (pageNumber - 1) * pageSize
        
        const sortField = `${sort_by || "title"}`
        const sortOrder = order_by ? order_by.includes("asc") ? 1 : -1 : -1 // 1 untuk ascending, -1 untuk descending
        let configFilter = {}

        // Build query conditions
        const whereCondition = query ? {
            $or: [
                { "title": { $regex: new RegExp(query, 'i') } },
                { "description": { $regex: new RegExp(query, 'i') } },
            ],
        } : {}

        // Setup Config Optional
        
        // Fetch data from Prisma
        let getData = await models.aggregate([
            // Melakukan Sorting Query Disini
            { $match: whereCondition },
            // Sorting berdasarkan field dan order yang ditentukan
            { $sort: { [sortField]: sortOrder } },
            // Menambahkan Pagination
            { $skip: skip },
            { $limit: pageSize },
            { $project: { title: 1, slug: 1, description: 1, price: 1, stock: 1, ownedBy: "$relation.companyname" } }
        ])
        
        // Send response
        res.send({
            message: "Successfull to get data!",
            status: 200,
            pagination: {
                totalData,
                page: pageNumber,
                size: pageSize,
                totalPages: Math.ceil(totalData / pageSize),
            },
            data: getData,
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const ReadDetail = async (req, res, next) => {
    const { id } = req.params

    try {
        let DataPassing = null
        if ( !id ) {
            throw {
                name: "Error!",
                status: 400, code: 400,
                message: "Code must be filled!"
            }
        } 

        const connection = await DynamicConnection(process.env.MongoDBURL)
        const models = await ProductSchema(connection)
        const getData = await models.findOne({ _id: id })
        
        if ( !getData ) {
            throw { 
                name: "Error!", status: 400,
                message: "Data is not exist!"
            }
        }

        DataPassing = getData

        res.send({
            message: "Successfull to get data!",
            status: 200,
            data: DataPassing
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const Create = async (req, res, next) => {
    const {
        title,
        slug,
        description,
        price,
        stock,
    } = req.body

    try {
        const connection = await DynamicConnection(process.env.MongoDBURL)
        const models = await ProductSchema(connection)
        
        let checkExist = await models.findOne({
            $or: [
                { slug: slug },
                { title: title },
            ]
        })

        if ( checkExist ) {
            throw {
                name: "Error", status: 400,
                message: "Data is already exist!"
            }
        }

        let userData = await UserSchema(connection).findOne({ username: req?.UserData?.username }).select('username companyname')
        let DataPassing = {
            title: title || null,
            slug: slug?.toLowerCase()?.replaceAll(" ", "-") || null,
            description: description || null,
            price: Number(price) || 0,
            stock: Number(stock) || 0,
            relation: {
                createdBy: userData?.username,
                updatedBy: null,
                companyname: userData?.companyname
            },
        }

        let createData = await models.create(DataPassing)

        return res.status(200).json({
            status: 200,
            message: 'Successfull to create data!',
        })
    } catch (error) {
        next(error)
    }
}

const Update = async (req, res, next) => {
    const { id } = req.params
    const {
        title,
        slug,
        description,
        price,
        stock,
    } = req.body

    try {
        const connection = await DynamicConnection(process.env.MongoDBURL)
        const models = await ProductSchema(connection)

        let existData = await models.findOne({ _id: id })
        if ( !existData ) {
            throw { 
                name: "Error!", status: 400,
                message: "Data is not exist!"
            }
        }

        let DataPassing = {
            title: title || existData?.title || null,
            slug: slug?.toLowerCase()?.replaceAll(" ", "-") || existData?.slug || null,
            description: description || existData?.description || null,
            price: Number(price) || existData?.price || 0,
            stock: Number(stock) || existData?.stock || 0,
            relation: {
                createdBy: existData?.relation?.createdBy,
                updatedBy: req.UserData?.username,
                companyname: existData?.relation?.companyname
            },
        }

        let updateData = await models.findOneAndUpdate(
            { _id: id }, // Kondisi untuk menemukan dokumen
            { $set: DataPassing }, // Nilai baru yang ingin diupdate
            { new: false, runValidators: true } // Opsi: 'new' mengembalikan dokumen yang telah diperbarui, 'runValidators' memvalidasi sebelum update
        )

        return res.status(200).json({
            status: 200,
            message: 'Successfull to update data!',
        })
    } catch (error) {
        next(error)
    }
}

const Delete = async (req, res, next) => {
    const { id } = req.params

    try {
        if ( !id ) {
            throw { 
                name: "Error!", status: 400,
                message: "Code must be filled!"
            }
        }

        const connection = await DynamicConnection(process.env.MongoDBURL)
        const models = await ProductSchema(connection)
        const deleteData = await models.findOneAndDelete({ _id: id })
        
        if ( !deleteData ) {
            throw { 
                name: "Error!", status: 400,
                message: "Data is not exist!"
            }
        }

        return res.status(200).json({
            status: 200,
            message: 'Successfull to delete data!',
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    ReadList,
    ReadDetail,
    Create,
    Update,
    Delete,
}
