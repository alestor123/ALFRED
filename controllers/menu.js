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
const { sendSettingsMenu, handleSettingsCallback } = require('./settingsController.js');
const updates = require('./updates.js');
const { sendTranslatedMessage } = require('../utils/translateAndSend');

module.exports = async (msg_or_callbackQuery, bot) => {
    try {
        const isCallback = msg_or_callbackQuery.message !== undefined;
        const chatId = isCallback ? msg_or_callbackQuery.message.chat.id : msg_or_callbackQuery.chat.id;
        const current_msg_for_reply = isCallback ? msg_or_callbackQuery.message : msg_or_callbackQuery;

        const user = await User.findOne({ chatId });
        if (!user) {
            await bot.sendMessage(chatId, '❌ Please register first using /register command.');
            return;
        }

        if (!isCallback) {
            await sendTranslatedMessage(
                bot,
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
                            [{ text: (user.settings?.isSilenced ? '🔊 UNMUTE' : '🔇 MUTE'), callback_data: 'mute' }],
                            [{ text: '💪 MOTIVATION', callback_data: 'motivation' }],
                            [{ text: '📚 EDUCATION', callback_data: 'education' }],
                            [{ text: '⚙️ SETTINGS', callback_data: 'settings' }],
                            [{ text: '🔄 UPDATES', callback_data: 'updates' }],
                            [{ text: 'ℹ️ ABOUT', callback_data: 'about' }]
                        ]
                    }
                }
            );
        }

        bot.off('callback_query');
        bot.on('callback_query', async (callbackQuery) => {
            if (callbackQuery.message && callbackQuery.message.chat.id !== chatId) return;

            try {
                const action = callbackQuery.data;
                const current_msg_from_callback = callbackQuery.message;

                if (action.startsWith('settings_')) {
                    await handleSettingsCallback(callbackQuery, bot);
                    return;
                }
                if (action.startsWith('study_')) {
                    // If menu.js's removeAllListeners is active, App.js's study_ handler won't work.
                    // So, menu.js listener would also need to call handleStudyCallback.
                    // For now, assuming study_ is handled by App.js and removeAllListeners isn't active or is managed.
                    // This highlights the need for a centralized callback router.
                    // For this specific fix, we focus on settings and menu navigation.
                }

                switch (action) {
                    case 'register': await prompt(current_msg_from_callback, bot); break;
                    case 'profile': await profile(current_msg_from_callback, bot); break;
                    case 'leetcode': await leetcode(current_msg_from_callback, bot); break;
                    case 'study_materials': await startStudyMenu(current_msg_from_callback, bot); break;
                    case 'dailyreport': await handleDailyReport(current_msg_from_callback, bot); break;
                    case 'currenttask': await fetchtask(current_msg_from_callback, bot); break;
                    case 'addtask': await task(current_msg_from_callback, bot); break;
                    case 'events': await events(current_msg_from_callback, bot); break;
                    case 'mute':
                        const isSilenced = !user.settings?.isSilenced;
                        await User.findOneAndUpdate({ chatId: callbackQuery.message.chat.id }, { 'settings.isSilenced': isSilenced });
                        await bot.sendMessage(callbackQuery.message.chat.id, `🔔 Notifications ${isSilenced ? 'muted' : 'unmuted'}`);
                        break;
                    case 'motivation': await motivation(current_msg_from_callback, bot); break;
                    case 'settings': 
                        await sendSettingsMenu(callbackQuery.message.chat.id, bot, current_msg_from_callback.message_id); 
                        break;
                    case 'updates': await updates(current_msg_from_callback, bot); break;
                    case 'about': await bot.sendMessage(callbackQuery.message.chat.id, responses.static.about); break;
                    case 'menu':
                        if (current_msg_from_callback) {
                            await bot.editMessageText(
                                `🎩 Welcome, Master! I'm Alfred Pennyworth, your trusted butler and productivity assistant. I'll help you stay on top of your tasks, manage your time, and achieve your goals.\n\n🔍 PLEASE CHOOSE AN OPTION BELOW:`,
                                {
                                    chat_id: callbackQuery.message.chat.id,
                                    message_id: current_msg_from_callback.message_id,
                                    reply_markup: current_msg_from_callback.reply_markup
                                }
                            );
                        } else {
                            await module.exports({ chat: { id: callbackQuery.message.chat.id } }, bot);
                        }
                        break;
                    default:
                        logger.warn(`Unhandled action in menu.js switch: ${action}`);
                        break;
                }
            } catch (error) {
                logger.error(`Menu action error (chatId: ${callbackQuery.message.chat.id}): ${error.message} for action: ${callbackQuery.data}`);
                await bot.sendMessage(callbackQuery.message.chat.id, '❌ An error occurred. Please try again.');
            }
        });

    } catch (error) {
        logger.error(`Menu controller error (chatId: ${chatId}): ${error.message}`);
        if (chatId) await bot.sendMessage(chatId, '❌ An error occurred while loading the menu.');
    }
};