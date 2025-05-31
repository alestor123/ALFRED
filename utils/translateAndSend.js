const translate = require('@vitalets/google-translate-api');
const { User } = require('../schema/models');

/**
 * Translates a message to the user's preferred language and sends it.
 * @param {object} bot - The Telegram bot instance
 * @param {string|number} chatId - The chat ID to send the message to
 * @param {string} text - The message text to send
 * @param {object} [options] - Additional options for bot.sendMessage
 */
async function sendTranslatedMessage(bot, chatId, text, options = {}) {
    try {
        // Fetch user language preference
        const user = await User.findOne({ chatId: String(chatId) });
        let lang = user?.settings?.language || 'en';
        if (lang !== 'en') {
            try {
                const result = await translate(text, { to: lang });
                text = result.text;
            } catch (err) {
                // If translation fails, fallback to original text
                console.error('Translation error:', err.message);
            }
        }
        await bot.sendMessage(chatId, text, options);
    } catch (err) {
        // Fallback: just send the original message
        await bot.sendMessage(chatId, text, options);
    }
}

/**
 * Translates a message to the user's preferred language and edits it.
 * @param {object} bot - The Telegram bot instance
 * @param {string|number} chatId - The chat ID
 * @param {number} messageId - The message ID to edit
 * @param {string} text - The new text
 * @param {object} [options] - Additional options for bot.editMessageText
 */
async function editTranslatedMessage(bot, chatId, messageId, text, options = {}) {
    try {
        const user = await User.findOne({ chatId: String(chatId) });
        let lang = user?.settings?.language || 'en';
        if (lang !== 'en') {
            try {
                const result = await translate(text, { to: lang });
                text = result.text;
            } catch (err) {
                console.error('Translation error:', err.message);
            }
        }
        await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...options });
    } catch (err) {
        // Fallback: just edit with the original message
        await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...options });
    }
}

module.exports = {
    sendTranslatedMessage,
    editTranslatedMessage
}; 