const cron = require('node-cron');
const { User } = require('../../schema/models');
const logger = require('../logging/logs');

// Reset motivation count at midnight
const resetDailyCounts = async () => {
    try {
        await User.updateMany(
            {},
            { 
                $set: { 
                    'settings.motivationCount': 0
                }
            }
        );
        logger('Daily motivation counts reset successfully');
    } catch (error) {
        logger.error('Error resetting daily counts: ' + error.message);
    }
};

// Schedule the reset for midnight (server time)
const scheduleDailyReset = () => {
    cron.schedule('0 0 * * *', resetDailyCounts);
    logger('Daily reset scheduler initialized');
};

module.exports = {
    scheduleDailyReset,
    resetDailyCounts
}; 