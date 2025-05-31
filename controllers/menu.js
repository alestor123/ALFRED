const { User } = require('../schema/models'); // To get user information from the database
const logger = require('../utils/logging/logs'); // For printing messages (logs)
const responses = require('../static/reponses/main.json'); // Pre-written bot replies
const prompt = require('./prompt.js'); // For asking the user questions
const leetcode = require('./leetcode.js'); // For LeetCode stuff
const profile = require('./profile.js'); // For user profile things
const motivation = require('./motivation.js'); // For motivational quotes
const task = require('./task.js'); // For adding tasks
const fetchtask = require('./fetchtask.js'); // For getting tasks
const events = require('./events.js'); // For events
const availability = require('./availability.js'); // For availability
const { startStudyMenu } = require('./studyController.js'); // For the study menu
const { handleDailyReport } = require('./dayreport.js'); // For daily reports
const { sendSettingsMenu, handleSettingsCallback } = require('./settingsController.js'); // For the settings menu
const updates = require('./updates.js'); // For bot updates
const { sendTranslatedMessage } = require('../utils/translateAndSend'); // Our special way to send messages

// This function shows the main menu and handles button clicks on it
module.exports = async (msg_or_callbackQuery, bot) => {
    let chatId; // Define chatId here so it's accessible in the catch block
    try {
        // Check if this was triggered by a button click (callback) or a new message
        const isCallback = msg_or_callbackQuery.message !== undefined;
        chatId = isCallback ? msg_or_callbackQuery.message.chat.id : msg_or_callbackQuery.chat.id; // Get the chat ID
        // const current_msg_for_reply = isCallback ? msg_or_callbackQuery.message : msg_or_callbackQuery; // Not currently used

        // Find the user in the database
        const user = await User.findOne({ chatId });
        if (!user) {
            // If user isn't registered, ask them to register
            await bot.sendMessage(chatId, '❌ Please register first using /register command.');
            return; // Stop here
        }

        // If it's not a button click (i.e., it's a command like /menu or /start)
        if (!isCallback) {
            // Send the main menu message with all the buttons
            await sendTranslatedMessage(
                bot,
                chatId,
                `🎩 Welcome, Master ${user.name || ""}! I'm Alfred Pennyworth, your trusted butler and productivity assistant. I'll help you stay on top of your tasks, manage your time, and achieve your goals.\n\n🔍 PLEASE CHOOSE AN OPTION BELOW:`,
                { // These are the buttons for the menu
                    reply_markup: {
                        inline_keyboard: [
                            // Each line is a row of buttons
                            [{ text: '📝 REGISTER', callback_data: 'register' }],
                            [{ text: '👤 PROFILE', callback_data: 'profile' }],
                            [{ text: '💻 LEETCODE STATUS', callback_data: 'leetcode' }],
                            [{ text: '📚 STUDY MATERIALS', callback_data: 'study_materials' }],
                            [{ text: '📊 DAILY REPORT', callback_data: 'dailyreport' }],
                            [{ text: '📅 TODAYS TASK', callback_data: 'currenttask' }],
                            [{ text: '➕ ADD TASK', callback_data: 'addtask' }],
                            [{ text: '📆 EVENTS', callback_data: 'events' }],
                            // Show Mute or Unmute based on user's setting
                            [{ text: (user.settings?.isSilenced ? '🔊 UNMUTE' : '🔇 MUTE'), callback_data: 'mute' }],
                            [{ text: '💪 MOTIVATION', callback_data: 'motivation' }],
                            [{ text: '📚 EDUCATION', callback_data: 'education' }], // Note: 'education' might be similar to 'study_materials'
                            [{ text: '⚙️ SETTINGS', callback_data: 'settings' }],
                            [{ text: '🔄 UPDATES', callback_data: 'updates' }],
                            [{ text: 'ℹ️ ABOUT', callback_data: 'about' }]
                        ]
                    }
                }
            );
        }

        // Make sure we're only listening for button clicks for THIS menu
        bot.off('callback_query'); // Remove any old listeners to avoid them firing multiple times
        bot.on('callback_query', async (callbackQuery) => {
            // Only process callbacks for the current chat
            if (callbackQuery.message && callbackQuery.message.chat.id !== chatId) {
                return; // This button click is for a different chat or an old menu
            }

            try {
                const action = callbackQuery.data; // What the button click means (the callback_data)
                const current_msg_from_callback = callbackQuery.message; // The message the button was on

                // If the button click is for settings, let the settings controller handle it
                if (action.startsWith('settings_')) {
                    await handleSettingsCallback(callbackQuery, bot);
                    return; // Done with this click
                }
                // Other specific callback prefixes like 'study_' are typically handled in App.js
                // to keep this menu handler focused on its own buttons.

                // Decide what to do based on the button's action
                switch (action) {
                    case 'register': await prompt(current_msg_from_callback, bot); break;
                    case 'profile': await profile(current_msg_from_callback, bot); break;
                    case 'leetcode': await leetcode(current_msg_from_callback, bot); break;
                    case 'study_materials': await startStudyMenu(current_msg_from_callback, bot); break; // Shows the study menu
                    case 'dailyreport': await handleDailyReport(current_msg_from_callback, bot); break;
                    case 'currenttask': await fetchtask(current_msg_from_callback, bot); break; // Shows current tasks
                    case 'addtask': await task(current_msg_from_callback, bot); break; // Starts adding a new task
                    case 'events': await events(current_msg_from_callback, bot); break;
                    case 'mute':
                        const newSilencedState = !user.settings?.isSilenced; // Flip the mute setting
                        // Save the new setting to the database
                        await User.findOneAndUpdate({ chatId: callbackQuery.message.chat.id }, { 'settings.isSilenced': newSilencedState });
                        // Tell the user what happened
                        await bot.sendMessage(callbackQuery.message.chat.id, `🔔 Notifications ${newSilencedState ? 'muted' : 'unmuted'}`);
                        // We should also update the menu button to reflect the new state.
                        // This requires re-sending or editing the menu, which can be complex here.
                        // For simplicity, the button text will update the next time the menu is loaded.
                        break;
                    case 'motivation': await motivation(current_msg_from_callback, bot); break;
                    case 'settings': 
                        // Show the settings menu
                        if (current_msg_from_callback) { // Make sure we have a message to reply to or edit
                           await sendSettingsMenu(callbackQuery.message.chat.id, bot, current_msg_from_callback.message_id);
                        } else {
                            // Fallback if message context is lost, though ideally this shouldn't happen
                            await sendSettingsMenu(callbackQuery.message.chat.id, bot);
                        }
                        break;
                    case 'updates': await updates(current_msg_from_callback, bot); break; // Show bot updates
                    case 'about': await bot.sendMessage(callbackQuery.message.chat.id, responses.static.about); break; // Show about message
                    case 'menu': // If 'menu' button is pressed (e.g., from settings to go back to main menu)
                        if (current_msg_from_callback) {
                            // Edit the existing menu message to show it again (avoids sending a new message)
                            // This provides a smoother experience than sending a brand new menu message.
                            await bot.editMessageText(
                                `🎩 Welcome, Master ${user.name || ""}! I'm Alfred Pennyworth, your trusted butler and productivity assistant. I'll help you stay on top of your tasks, manage your time, and achieve your goals.\n\n🔍 PLEASE CHOOSE AN OPTION BELOW:`,
                                {
                                    chat_id: callbackQuery.message.chat.id,
                                    message_id: current_msg_from_callback.message_id,
                                    reply_markup: current_msg_from_callback.reply_markup // Re-use the same buttons
                                }
                            );
                        } else {
                            // If for some reason we don't have the original message, send a new menu
                            // This is a fallback.
                            await module.exports({ chat: { id: callbackQuery.message.chat.id } }, bot);
                        }
                        break;
                    default:
                        // If we don't know this button action
                        logger.warn(`Unhandled action in menu.js switch: ${action} for chat ID ${chatId}`);
                        break;
                }
            } catch (error) {
                logger.error(`Menu action error (chatId: ${callbackQuery.message?.chat?.id || chatId}): ${error.message} for action: ${callbackQuery.data}`);
                if (callbackQuery.message?.chat?.id) {
                   await bot.sendMessage(callbackQuery.message.chat.id, '❌ An error occurred while processing this action. Please try again.'); // Tell the user
                }
            }
        });

    } catch (error) {
        logger.error(`Menu controller main error (chatId: ${chatId || 'unknown'}): ${error.message}`);
        // Tell the user if the whole menu loading failed
        if (chatId) { // Ensure chatId is available before sending a message
            await bot.sendMessage(chatId, '❌ An error occurred while loading the menu. Please try /start again.');
        }
    }
};