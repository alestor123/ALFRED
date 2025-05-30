const mongoose = require('mongoose');
const logger = require('../logging/logs');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alfred';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        logger.info('MongoDB connected successfully');
    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        logger.info('MongoDB disconnected successfully');
    } catch (error) {
        logger.error(`MongoDB disconnection error: ${error.message}`);
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    logger.error('MongoDB error: ' + err.message);
});

module.exports = {
    connectDB,
    disconnectDB
}; 