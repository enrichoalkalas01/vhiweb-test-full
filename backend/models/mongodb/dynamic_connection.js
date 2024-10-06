const mongoose = require('mongoose')

const connectToDatabase = async (DBURL) => {
    try {
        mongoose.set('strictQuery', false)
        const conn = await mongoose.createConnection(DBURL, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })

        conn.on('connected', () => {
            console.log(`Mongoose connected to ${DBURL}`)
            // Menutup koneksi setelah 5 detik
            setTimeout(async () => {
                try {
                    await conn.close();
                    console.log('Mongoose connection closed after 5 seconds');
                } catch (error) {
                    console.error('Failed to close connection:', error);
                }
            }, 5000)
        })

        conn.on('error', (err) => {
            console.error(`Mongoose connection error: ${err}`)
        })

        conn.on('disconnected', () => {
            console.log(`Mongoose disconnected from ${DBURL}`)
        })

        conn.on('reconnected', () => {
            console.log('Mongoose reconnected')
        })

        return conn
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error)
        process.exit(1)
    }
}

const disconnectFromDatabase = async (conn) => {
    try {
        await conn.close();
        console.log('MongoDB connection closed successfully');
    } catch (error) {
        console.error('Failed to close MongoDB connection:', error);
    }
}

process.on('SIGINT', async () => {
    const conn = await connectToDatabase(); // Ensure conn is your connection instance
    await disconnectFromDatabase(conn);
    console.log('App terminated, MongoDB connection closed');
    process.exit(0);
})

module.exports = { connectToDatabase, disconnectFromDatabase }