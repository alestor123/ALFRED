require('dotenv').config();
const { connectDB, disconnectDB } = require('./utils/db/mongo');
const { User, Event, Availability } = require('./schema/models');
const jsonDB = require('./schema/db');
const logger = require('./utils/logging/logs');

async function migrateData() {
    try {
        // Connect to MongoDB
        await connectDB();
        logger.info('Starting migration...');

        // Get all users from JSON DB
        const jsonData = jsonDB.storage;
        
        // Migrate each user
        for (const [chatId, userData] of Object.entries(jsonData)) {
            try {
                // Convert chatId to number
                const numericChatId = parseInt(chatId);
                
                // Check if user already exists
                const existingUser = await User.findOne({ chatId: numericChatId });
                if (existingUser) {
                    logger.info(`User ${chatId} already exists in MongoDB, skipping...`);
                    continue;
                }

                // Create new user document
                const user = new User({
                    chatId: numericChatId,
                    name: userData.name,
                    fullname: userData.fullname,
                    leetcode: userData.leetcode,
                    wakeupTime: userData.wakeupTime,
                    bedTime: userData.bedTime,
                    motivationChannelID: userData.motivationChannelID,
                    studyPrefTime: userData.studyPrefTime,
                    workPrefTime: userData.workPrefTime,
                    exercisePrefTime: userData.exercisePrefTime,
                    chorePrefTime: userData.chorePrefTime,
                    goalPrefTime: userData.goalPrefTime,
                    idlePrefTime: userData.idlePrefTime,
                    settings: {
                        isSilenced: userData.isSilenced || false
                    },
                    reminders: userData.reminders || [],
                    tasks: userData.tasks || []
                });

                // Save user to MongoDB
                await user.save();
                logger.info(`Migrated user ${chatId} to MongoDB`);
            } catch (error) {
                logger.error(`Error migrating user ${chatId}: ${error.message}`);
            }
        }

        logger.info('Migration completed successfully');
    } catch (error) {
        logger.error(`Migration failed: ${error.message}`);
    } finally {
        // Disconnect from MongoDB
        await disconnectDB();
    }
}

// Run migration
migrateData().then(() => {
    logger.info('Migration script finished');
    process.exit(0);
}).catch(error => {
    logger.error(`Migration script failed: ${error.message}`);
    process.exit(1);
}); 