const { User } = require('../schema/models');
const logger = require('../utils/logging/logs');
const responses = require('../static/reponses/main.json');
const prompt = require('./prompt.js');
const leetcode = require('./leetcode.js');
const profile = require('./profile.js');
const motivation = require('./motivation.js');
const task = require('./task.js');
const fetchtask = require('./fetchtask.js');
const events = require('./events.js');
const availability = require('./availability.js');
const { startStudyMenu } = require('./studyController.js');
const { handleDailyReport } = require('./dayreport.js');

module.exports = async (msg, bot) => {
    try {
        const chatId = msg.chat.id;

        // Get user from MongoDB
        const user = await User.findOne({ chatId });
        if (!user) {
            await bot.sendMessage(
                chatId,
                '❌ Please register first using /register command.'
            );
            return;
        }

        // Remove any existing callback query listeners to prevent multiple handlers for the same menu
        bot.removeAllListeners("callback_query");

        // Send menu message
        await bot.sendMessage(
            chatId,
            `🎩 Welcome, Master ${user.name || ""}! I'm Alfred Pennyworth, your trusted butler and productivity assistant. I'll help you stay on top of your tasks, manage your time, and achieve your goals.\n\n🔍 PLEASE CHOOSE AN OPTION BELOW:`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📝 REGISTER', callback_data: 'register' }],
                        [{ text: '👤 PROFILE', callback_data: 'profile' }],
                        [{ text: '💻 LEETCODE STATUS', callback_data: 'leetcode' }],
                        [{ text: '📚 STUDY MATERIALS', callback_data: 'study_materials' }],
                        [{ text: '📊 DAILY REPORT', callback_data: 'dailyreport' }],
                        [{ text: '📅 TODAYS TASK', callback_data: 'currenttask' }],
                        [{ text: '➕ ADD TASK', callback_data: 'addtask' }],
                        [{ text: '📆 EVENTS', callback_data: 'events' }],
                        [{ text: '🕒 AVAILABILITY', callback_data: 'availability' }],
                        [{ text: '⏰ REMINDERS', callback_data: 'reminder' }],
                        [{ text: (user.settings?.isSilenced ? '🔊 UNMUTE' : '🔇 MUTE'), callback_data: 'mute' }],
                        [{ text: '💪 MOTIVATION', callback_data: 'motivation' }],
                        [{ text: '📚 EDUCATION', callback_data: 'education' }],
                        [{ text: '⚙️ SETTINGS', callback_data: 'settings' }],
                        [{ text: '🔄 UPDATES', callback_data: 'updates' }],
                        [{ text: 'ℹ️ ABOUT', callback_data: 'about' }],
                    ],
                },
            }
        );

        // Handle menu selections
        bot.on('callback_query', async (callbackQuery) => {
            try {
                const action = callbackQuery.data;
                const current_msg = callbackQuery.message;

                switch (action) {
                    case 'register':
                        await bot.sendMessage(
                            chatId,
                            "Thanks for joining, Master! I'm here to help you stay productive and achieve your goals. Please send your answers as replies to the following questions."
                        );
                        await prompt(current_msg, bot);
                        break;
                    case 'study_materials':
                        await startStudyMenu(current_msg, bot);
                        break;
                    case 'leetcode':
                        await leetcode(current_msg, bot);
                        break;
                    case 'profile': 
                        await profile(current_msg, bot);
                        break; 
                    case 'motivation': 
                        await motivation(current_msg, bot);
                        break; 
                    case 'addtask': 
                        await task(current_msg, bot);
                        break; 
                    case 'availability':
                        await availability(current_msg, bot);
                        break; 
                    case 'currenttask': 
                        await fetchtask(current_msg, bot);
                        break; 
                    case 'events': 
                        await events(current_msg, bot);
                        break;
                    case 'dailyreport':
                        await handleDailyReport(current_msg, bot);
                        break;
                    case 'about': 
                        await bot.sendMessage(chatId, responses.static.about);
                        break;
                    case 'mute': 
                        const isSilenced = !user.settings?.isSilenced;
                        await User.findOneAndUpdate(
                            { chatId },
                            { 'settings.isSilenced': isSilenced }
                        );
                        await bot.sendMessage(
                            chatId,
                            `🔔 Notifications ${isSilenced ? 'muted' : 'unmuted'}`
                        );
                        break;
                    case 'updates':
                        await updates(current_msg, bot);
                        break;
                }
            } catch (error) {
                logger.error(`Menu action error: ${error.message}`);
                await bot.sendMessage(
                    chatId,
                    '❌ An error occurred. Please try again.'
                );
            }
        });
    } catch (error) {
        logger.error(`Menu controller error: ${error.message}`);
        await bot.sendMessage(
            msg.chat.id,
            '❌ An error occurred. Please try again.'
        );
    }
};