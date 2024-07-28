const mongoose = require("mongoose");

const logger = require("../util/logger");

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);

        logger.info(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
        logger.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
