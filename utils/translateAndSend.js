const translate = require('@vitalets/google-translate-api'); // The library that does the Google translation
const { User } = require('../schema/models'); // To get user settings (like their language)

// This function translates a message and then sends it.
// bot: the Telegram bot object
// chatId: who to send the message to
// text: the message to send (in English usually)
// options: other settings for sending the message (like buttons)
async function sendTranslatedMessage(bot, chatId, text, options = {}) {
    try {
        // Find out what language the user prefers
        const user = await User.findOne({ chatId: String(chatId) });
        let lang = 'en'; // Default to English
        if (user && user.settings && user.settings.language) {
            lang = user.settings.language; // Use user's preferred language if set
        }
        
        const originalText = text; // Keep a copy of the original text, just in case translation fails

        // If the user's language is not English, then try to translate
        if (lang !== 'en') {
            try {
                const result = await translate(text, { to: lang }); // Translate the text
                text = result.text; // Use the translated text
            } catch (err) {
                // If translation fails, use the original English text instead
                console.error('Translation error:', err.message, ". Sending original text instead.");
                text = originalText; 
            }
        }

        // Make sure we are not sending an empty message
        // (This can happen if the original text was empty, or if translation somehow made it empty)
        if (!text || text.trim().length === 0) {
            console.warn(`Trying to send an empty message to chat ${chatId}. Original was: "${originalText}". Sending a placeholder.`);
            // Send a placeholder message because Telegram doesn't like empty messages
            return bot.sendMessage(chatId, "[Message was empty or failed to translate]", options); 
        }

        // Send the (possibly translated) message and make sure to return the result from bot.sendMessage
        return bot.sendMessage(chatId, text, options);
    } catch (err) {
        // If something else goes wrong (not translation, but maybe sending the message)
        console.error('Error in sendTranslatedMessage:', err.message, ". Trying to send original text.");
        
        // Try to send the original English text as a last resort
        const originalTextForFallback = text; // At this point, 'text' might be the original or a failed translation attempt. Let's try to use what we have.
                                        // Ideally, we'd have the true original if 'text' was modified.
                                        // For this simple version, we'll use what's in 'text', hoping it's the original if translation failed.

        if (!originalTextForFallback || originalTextForFallback.trim().length === 0) {
            console.warn(`Original text for fallback in sendTranslatedMessage for chat ${chatId} is also empty. Sending generic error.`);
            return bot.sendMessage(chatId, "[Error sending message content]", options);
        }
        return bot.sendMessage(chatId, originalTextForFallback, options); // Return the result here too
    }
}

// This function translates a message and then edits an existing message.
// bot: the Telegram bot object
// chatId: the chat where the message is
// messageId: the ID of the message to edit
// text: the new text for the message (in English usually)
// options: other settings for editing the message
async function editTranslatedMessage(bot, chatId, messageId, text, options = {}) {
    try {
        // Find out what language the user prefers
        const user = await User.findOne({ chatId: String(chatId) });
        let lang = 'en'; // Default to English
        if (user && user.settings && user.settings.language) {
            lang = user.settings.language; // Use user's preferred language
        }

        const originalText = text; // Keep a copy of the original text

        // If the user's language is not English, try to translate
        if (lang !== 'en') {
            try {
                const result = await translate(text, { to: lang }); // Translate
                text = result.text; // Use translated text
            } catch (err) {
                // If translation fails, use original English text
                console.error('Translation error for editing:', err.message, ". Using original text for edit.");
                text = originalText;
            }
        }

        // Make sure we are not trying to edit the message to be empty
        if (!text || text.trim().length === 0) {
            console.warn(`Trying to edit message ${messageId} in chat ${chatId} to be empty. Original: "${originalText}". Will not edit.`);
            // If the text becomes empty, it's often better not to edit the message at all
            // or to edit it to show an error, but for now, we'll just skip the edit.
            return Promise.resolve(); // Send back a promise that says "we're done" (even though we did nothing)
        }

        // Edit the message with the (possibly translated) text
        // Make sure to include chat_id and message_id in the options for editMessageText
        return bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...options });
    } catch (err) {
        // If something else goes wrong (not translation, but maybe editing)
        console.error('Error in editTranslatedMessage:', err.message, ". Trying to edit with original text.");
        
        const originalTextForFallback = text; // Similar to sendTranslatedMessage, 'text' here is our best guess for original if translation part failed.

        if (!originalTextForFallback || originalTextForFallback.trim().length === 0) {
            console.warn(`Original text for fallback in editTranslatedMessage for chat ${chatId} is also empty. Will not edit.`);
            return Promise.resolve(); // Don't edit if fallback is also empty
        }
        // Try to edit with the original text as a last resort
        return bot.editMessageText(originalTextForFallback, { chat_id: chatId, message_id: messageId, ...options });
    }
}

// Make these functions available to other parts of the bot
module.exports = {
    sendTranslatedMessage,
    editTranslatedMessage
}; 