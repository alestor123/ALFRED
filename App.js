require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { connectDB } = require('./utils/db/mongo');
const logger = require('./utils/logging/logs');
const { scheduleDailyReset } = require('./utils/cron/daily-reset');
const { scheduleTaskReminders } = require('./utils/cron/task-reminders');

// Import controllers
const register = require('./controllers/register');
const updates = require('./controllers/updates');
const leetcode = require('./controllers/leetcode');
const motivation = require('./controllers/motivation');
const events = require('./controllers/events');
const task = require('./controllers/task');
const availability = require('./controllers/availability');
const prompt = require('./controllers/prompt');
const fetchtask = require('./controllers/fetchtask');
const menu = require('./controllers/menu');
const responses = require('./controllers/responses');

module.exports = (token) => {
    if (!token) {
        logger.error('BOT_TOKEN is not provided to App.js');
        process.exit(1);
    }

    const bot = new TelegramBot(token, { polling: true });

    // Connect to MongoDB and initialize bot
    connectDB().then(() => {
        logger.info('Bot is starting...');

        // Initialize schedulers
        scheduleDailyReset();
        scheduleTaskReminders(bot);

        // Bot event handlers
        bot.on('message', async (msg) => {
            try {
                const chatId = msg.chat.id;
                const messageText = msg.text;

                // Handle commands and messages
                if (messageText === '/start' || messageText === '/menu') {
                    await menu(msg, bot);
                } else if (messageText === '/updates') {
                    await updates(msg, bot);
                } else if (messageText === '/leetcode') {
                    await leetcode(msg, bot);
                } else if (messageText === '/motivation') {
                    await motivation(msg, bot);
                } else if (messageText === '/events') {
                    await events(msg, bot);
                } else if (messageText === '/task') {
                    await task(msg, bot);
                } else if (messageText === '/tasks') {
                    await fetchtask({ message: msg, data: 'all' }, bot);
                } else if (messageText === '/availability') {
                    await availability(msg, bot);
                } else if (messageText === '/register') {
                    await register(msg, bot);
                } else {
                    await responses(msg, bot);
                }
            } catch (error) {
                logger.error(`Error in message handler: ${error.message}`);
                try {
                    await bot.sendMessage(msg.chat.id, '❌ An error occurred while processing your message.');
                } catch (sendError) {
                    logger.error(`Failed to send error message: ${sendError.message}`);
                }
            }
        });

        // Handle callback queries
        bot.on('callback_query', async (callbackQuery) => {
            try {
                const action = callbackQuery.data;
                const msg = callbackQuery.message;
                
                if (action.startsWith('task_')) {
                    await fetchtask(callbackQuery, bot);
                } else if (action.startsWith('prompt_')) {
                    await prompt(callbackQuery, bot);
                } else if (action === 'refresh_announcements') {
                    const refreshMsg = {
                        chat: {
                            id: msg.chat.id
                        },
                        text: '/updates'
                    };
                    await updates(refreshMsg, bot);
                } else if (action === 'menu') {
                    await menu({ chat: { id: msg.chat.id } }, bot);
                }
            } catch (error) {
                logger.error(`Error in callback query handler: ${error.message}`);
                try {
                    await bot.sendMessage(callbackQuery.message.chat.id, '❌ An error occurred while processing your request.');
                } catch (sendError) {
                    logger.error(`Failed to send error message: ${sendError.message}`);
                }
            }
        });

        logger.info('Bot is ready and listening for messages');
    }).catch(error => {
        logger.error(`Failed to start the bot: ${error.message}`);
        process.exit(1);
    });
};