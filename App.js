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
const { startStudyMenu, handleStudyCallback } = require('./controllers/studyController.js');
const { handleDailyReport } = require('./controllers/dayreport.js');

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
                } else if (messageText === '/study') {
                    await startStudyMenu(msg, bot);
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
                } else if (messageText === '/report') {
                    await handleDailyReport(msg, bot);
                } else {
                    await responses(msg, bot);
                }
            } catch (error) {
                logger.error(`Error in message handler: ${error.message} (ChatID: ${msg.chat.id})`);
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
                
                if (action.startsWith('study_')) {
                    await handleStudyCallback(callbackQuery, bot);
                } else if (action.startsWith('task_')) {
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
                    await menu({ chat: { id: msg.chat.id }, message_id: msg.message_id }, bot);
                } else {
                    // Fallback to main menu listener if no other handler caught it.
                    // This assumes the main menu sets up a general callback listener.
                    // To avoid conflicts, it might be better if menu.js handles its own callbacks
                    // or App.js explicitly calls menu's callback handler.
                    // For now, let main menu's listener (if any active from its last call) try to handle it.
                    // This part can be tricky if multiple controllers listen to general 'callback_query'.
                    // A more robust system would have App.js explicitly call the relevant controller's callback handler
                    // or ensure only one specific callback listener is active at a time per chat.
                }
            } catch (error) {
                logger.error(`Error in callback_query handler: ${error.message} (ChatID: ${callbackQuery.message.chat.id})`);
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