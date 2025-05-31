require('dotenv').config(); // For loading stuff from a .env file
const TelegramBot = require('node-telegram-bot-api'); // The main library for the Telegram bot
const { connectDB } = require('./utils/db/mongo'); // Our function to connect to the database
const logger = require('./utils/logging/logs'); // For printing messages to the console (logs)
const { scheduleDailyReset } = require('./utils/cron/daily-reset'); // For tasks that run at set times (cron jobs) - daily reset
const { scheduleTaskReminders } = require('./utils/cron/task-reminders'); // For task reminders, also a cron job
const patchBotForTranslation = require('./utils/patchBotForTranslation'); // Makes our bot speak different languages

// Getting all the different parts of our bot that handle commands
const register = require('./controllers/register');
const updates = require('./controllers/updates');
const leetcode = require('./controllers/leetcode');
const motivation = require('./controllers/motivation');
const events = require('./controllers/events');
const task = require('./controllers/task');
const availability = require('./controllers/availability');
const prompt = require('./controllers/prompt'); // For asking questions
const fetchtask = require('./controllers/fetchtask'); // For getting tasks
const menu = require('./controllers/menu'); // The main menu handler
const responses = require('./controllers/responses'); // For simple bot replies
const { startStudyMenu, handleStudyCallback } = require('./controllers/studyController.js'); // For the study section
const { handleDailyReport } = require('./controllers/dayreport.js'); // For daily reports
const { handleSettingsCallback } = require('./controllers/settingsController.js'); // For settings menu

// This is the main function that starts up everything for the bot
module.exports = (token) => {
    if (!token) {
        // If we don't have a token, the bot can't work
        logger.error('BOT_TOKEN is not provided to App.js');
        process.exit(1); // Stop the program
    }

    // Creating the bot object itself!
    const bot = new TelegramBot(token, { polling: true }); // polling: true means it keeps checking for new messages
    patchBotForTranslation(bot); // Apply our translation magic

    // Try to connect to the database
    connectDB().then(() => {
        logger.info('Bot is starting...'); // Let us know it's starting

        // Set up scheduled tasks
        scheduleDailyReset();
        scheduleTaskReminders(bot);

        // This part listens for any new messages sent to the bot
        bot.on('message', async (msg) => {
            try {
                const chatId = msg.chat.id; // Who sent the message
                const messageText = msg.text; // What the message says

                // Check what the message says and do the right thing
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
                    await fetchtask({ message: msg, data: 'all' }, bot); // Show all tasks
                } else if (messageText === '/availability') {
                    await availability(msg, bot);
                } else if (messageText === '/register') {
                    await register(msg, bot);
                } else if (messageText === '/report') {
                    await handleDailyReport(msg, bot);
                } else {
                    // If it's not a known command, try our general responses
                    await responses(msg, bot);
                }
            } catch (error) {
                logger.error(`Error in message handler: ${error.message} (ChatID: ${msg.chat.id})`);
                try {
                    // Try to tell the user something went wrong
                    await bot.sendMessage(msg.chat.id, '❌ An error occurred while processing your message.');
                } catch (sendError) {
                    logger.error(`Failed to send error message: ${sendError.message}`);
                }
            }
        });

        // This part listens for button clicks (callback queries)
        bot.on('callback_query', async (callbackQuery) => {
            try {
                const action = callbackQuery.data; // What action the button wants to do
                const msg = callbackQuery.message; // The message the button was attached to
                
                // Figure out which button was pressed based on its action data
                if (action.startsWith('study_')) {
                    await handleStudyCallback(callbackQuery, bot);
                } else if (action.startsWith('task_')) {
                    await fetchtask(callbackQuery, bot);
                } else if (action.startsWith('prompt_')) {
                    await prompt(callbackQuery, bot);
                } else if (action.startsWith('settings_')) {
                    await handleSettingsCallback(callbackQuery, bot);
                } else if (action === 'refresh_announcements') {
                    // This is a bit of a workaround to make refresh work like sending /updates
                    const refreshMsg = {
                        chat: {
                            id: msg.chat.id
                        },
                        text: '/updates' // Pretend the user typed /updates
                    };
                    await updates(refreshMsg, bot);
                } else if (action === 'menu') {
                    await menu(msg, bot); // Show the main menu
                } else {
                    // If we don't know this button, log a warning
                    logger.warn(`Unhandled callback query in App.js: ${action}`);
                }
            } catch (error) {
                logger.error(`Error in callback_query handler: ${error.message} (ChatID: ${callbackQuery.message.chat.id})`);
                try {
                    // Tell the user about the error
                    await bot.sendMessage(callbackQuery.message.chat.id, '❌ An error occurred while processing your request.');
                } catch (sendError) {
                    logger.error(`Failed to send error message: ${sendError.message}`);
                }
            }
        });

        logger.info('Bot is ready and listening for messages'); // All good!
    }).catch(error => {
        // If database connection or something else fails badly at start
        logger.error(`Failed to start the bot: ${error.message}`);
        process.exit(1); // Stop everything
    });
};