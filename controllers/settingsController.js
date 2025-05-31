const { User } = require('../schema/models');
const logger = require('../utils/logging/logs');

// Main settings menu
async function sendSettingsMenu(chatId, bot, messageId) {
    const text = '⚙️ Settings: Choose an option';
    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🌐 Languages', callback_data: 'settings_select_language_menu' }],
                [{ text: '⬅️ Back to Main Menu', callback_data: 'menu' }]
            ]
        }
    };
    if (messageId) {
        await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...options });
    } else {
        await bot.sendMessage(chatId, text, options);
    }
}

// Language selection menu
async function sendLanguageSelectionMenu(chatId, bot, messageId) {
    const text = '🌐 Select your preferred language:';
    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🇬🇧 English', callback_data: 'settings_set_lang_en' }],
                [{ text: '🇮🇳 Malayalam', callback_data: 'settings_set_lang_ml' }],
                [{ text: '🇮🇳 Hindi', callback_data: 'settings_set_lang_hi' }],
                [{ text: '⬅️ Back to Settings', callback_data: 'settings_main' }]
            ]
        }
    };
    if (messageId) {
        await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...options });
    } else {
        // This case should ideally not happen if coming from settings menu
        await bot.sendMessage(chatId, text, options);
    }
}

// Handle callback queries for settings
async function handleSettingsCallback(callbackQuery, bot) {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const action = callbackQuery.data;

    logger.info(`Settings callback: ${action} for chat ID: ${chatId}`);

    try {
        if (action === 'settings_select_language_menu') {
            await sendLanguageSelectionMenu(chatId, bot, messageId);
        } else if (action.startsWith('settings_set_lang_')) {
            const langCode = action.split('_')[3]; // e.g., 'en', 'ml', 'hi'
            await User.findOneAndUpdate({ chatId }, { 'settings.language': langCode });
            await bot.answerCallbackQuery(callbackQuery.id, { text: `Language set to ${langCode.toUpperCase()}` });
            // Go back to settings menu after selection
            await sendSettingsMenu(chatId, bot, messageId);
        } else if (action === 'settings_main') {
            await sendSettingsMenu(chatId, bot, messageId);
        }
    } catch (error) {
        logger.error(`Error in settings callback (${action}): ${error.message}`);
        await bot.sendMessage(chatId, '❌ An error occurred while updating settings.');
    }
}

module.exports = {
    sendSettingsMenu,
    handleSettingsCallback
}; 