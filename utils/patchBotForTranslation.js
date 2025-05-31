const { translate } = require('@vitalets/google-translate-api');

const { User } = require('../schema/models');

async function getUserLang(chatId) {
    try {
        const user = await User.findOne({ chatId: String(chatId) });
        return user?.settings?.language || 'en';
    } catch {
        return 'en';
    }
}

function patchBotForTranslation(bot) {
    // Save originals
    const origSendMessage = bot.sendMessage.bind(bot);
    const origEditMessageText = bot.editMessageText.bind(bot);

    bot.sendMessage = async function(chatId, text, options = {}) {
        let lang = await getUserLang(chatId);
        if (lang !== 'en') {
            try {
                const result = await translate(text, { to: lang });
                text = result.text;
            } catch (err) {
                console.error('Translation error:', err.message);
            }
        }
        // Prevent sending empty or whitespace-only messages
        if (!text || !text.replace(/\s/g, '').length) {
            console.warn(`Not sending empty message to chatId ${chatId}`);
            return;
        }
        return origSendMessage(chatId, text, options);
    };

    bot.editMessageText = async function(text, opts = {}) {
        let chatId = opts.chat_id;
        let lang = chatId ? await getUserLang(chatId) : 'en';
        if (lang !== 'en') {
            try {
                const result = await translate(text, { to: lang });
                text = result.text;
            } catch (err) {
                console.error('Translation error:', err.message);
            }
        }
        // Prevent sending empty or whitespace-only messages
        if (!text || !text.replace(/\s/g, '').length) {
            console.warn(`Not editing message to empty text for chatId ${chatId}`);
            return;
        }
        return origEditMessageText(text, opts);
    };
}

module.exports = patchBotForTranslation; 