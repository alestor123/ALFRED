const { translate } = require('@vitalets/google-translate-api'); // The library for Google translating
const { User } = require('../schema/models'); // To get user settings, like their preferred language

// Helper function to get the user's language preference from the database
async function getUserLang(chatId) {
    try {
        const user = await User.findOne({ chatId: String(chatId) }); // Find the user
        return user?.settings?.language || 'en'; // Return their language, or 'en' (English) if not found
    } catch (error) {
        // If there's an error getting the language, just default to English
        console.error("Error fetching user language, defaulting to 'en':", error.message);
        return 'en';
    }
}

// This function changes the bot's normal send and edit message functions
// so they automatically translate text before sending/editing.
function patchBotForTranslation(bot) {
    // Keep a copy of the bot's original sendMessage function
    const originalSendMessage = bot.sendMessage.bind(bot);
    // Keep a copy of the bot's original editMessageText function
    const originalEditMessageText = bot.editMessageText.bind(bot);

    // Replace the bot's sendMessage with our new version
    bot.sendMessage = async function(chatId, text, options = {}) {
        // Get the user's language
        let lang = await getUserLang(chatId);
        const originalText = text; // Save the original text in case translation fails

        // If the user's language is not English, try to translate
        if (lang !== 'en') {
            try {
                const result = await translate(text, { to: lang }); // Translate it!
                text = result.text; // Use the translated text
            } catch (err) {
                // If translation fails, log the error. We'll send the original text.
                console.error('Translation error (in patched sendMessage):', err.message, ". Sending original text.");
                text = originalText; // Use the original if translation didn't work
            }
        }

        // Don't send messages if they are empty or just spaces
        if (!text || text.trim().length === 0) {
            console.warn(`Prevented sending empty message to chatId ${chatId} via patched sendMessage. Original was: "${originalText}"`);
            // We just stop and don't send anything if the message becomes empty.
            // We must return something that looks like what originalSendMessage would return (a Promise)
            // or the calling code might break. Returning a resolved promise is safest.
            return Promise.resolve(); 
        }
        // Call the bot's original sendMessage function with the (possibly translated) text
        return originalSendMessage(chatId, text, options);
    };

    // Replace the bot's editMessageText with our new version
    bot.editMessageText = async function(text, opts = {}) { // 'opts' usually contains chat_id, message_id, etc.
        let chatId = opts.chat_id; // Get the chat ID from the options
        let lang = 'en'; // Default to English
        if (chatId) { // Only try to get language if we have a chat ID
            lang = await getUserLang(chatId);
        }
        const originalText = text; // Save the original text

        // If the user's language is not English, and we have a language, try to translate
        if (lang !== 'en') {
            try {
                const result = await translate(text, { to: lang }); // Translate it!
                text = result.text; // Use the translated text
            } catch (err) {
                // If translation fails, log the error. We'll use the original text.
                console.error('Translation error (in patched editMessageText):', err.message, ". Using original text.");
                text = originalText; // Use the original if translation didn't work
            }
        }

        // Don't edit messages to be empty or just spaces
        if (!text || text.trim().length === 0) {
            console.warn(`Prevented editing message to empty for chatId ${chatId} via patched editMessageText. Original was: "${originalText}"`);
            // Similar to sendMessage, stop if the text becomes empty.
            return Promise.resolve();
        }
        // Call the bot's original editMessageText function with the (possibly translated) text
        return originalEditMessageText(text, opts);
    };
}

// Make this patching function available to other parts of the bot (specifically App.js)
module.exports = patchBotForTranslation; 