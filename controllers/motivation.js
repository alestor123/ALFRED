const {resolve} = require('path')
// var db = require('../schema/db.js') // No longer needed for simple quotes
// var youtubeShorts = require('../utils/youtube/youtube.js'); // Removed
// const randomVideo = require('../utils/youtube/randomVideo.js'); // Removed
// const { sync } = require('rimraf') // Removed, was for deleting video files
const dbJSON = require('../static/db/db.json') // Keep for channel ID check, or remove if not needed
const axios = require('axios'); // Added for API calls
const { sendTranslatedMessage } = require('../utils/translateAndSend'); // Import translation utility

module.exports = async (msg,bot) => {
    const chatId = msg.chat.id;
    // We can keep the motivationChannelID check if you want to restrict quotes to channels
    // that were previously set up for motivation, or remove it to allow quotes anywhere.
    // For now, I'll assume we don't need the channelID check for quotes.
    // if(dbJSON[chatId] && dbJSON[chatId].motivationChannelID) { // Optional: keep if you want to use this check
    try {
        const response = await axios.get('https://zenquotes.io/api/random');
        if (response.data && response.data.length > 0) {
            const quote = response.data[0].q;
            const author = response.data[0].a;
            const message = `"${quote}"\n- ${author}`;
            await sendTranslatedMessage(bot, chatId, message, { parse_mode: 'HTML' });
        } else {
            await sendTranslatedMessage(bot, chatId, "Could not fetch a Zen quote at this time. Please try again later.");
        }
    } catch (error) {
        console.error("Error fetching Zen quote:", error);
        await sendTranslatedMessage(bot, chatId, "Sorry, there was an error getting a Zen quote.");
    }
    // } // Optional: closing brace for the motivationChannelID check
    // else bot.sendMessage(chatId, "Motivation feature is not configured for this chat."); // Optional: message if channelID check fails
}