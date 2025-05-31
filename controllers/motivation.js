// const {resolve} = require('path') // Not used, so we can remove it
// var db = require('../schema/db.js') // No longer needed for simple quotes
// var youtubeShorts = require('../utils/youtube/youtube.js'); // Removed
// const randomVideo = require('../utils/youtube/randomVideo.js'); // Removed
// const { sync } = require('rimraf') // Removed, was for deleting video files
const axios = require('axios'); // For making HTTP requests to get quotes from the internet
const { sendTranslatedMessage } = require('../utils/translateAndSend'); // Our special function to send messages in the user's language

// This function gets a random quote and sends it
module.exports = async (msg, bot) => {
    const chatId = msg.chat.id; // Get the ID of the chat where the message came from

    try {
        // Try to get a random quote from the ZenQuotes API
        const response = await axios.get('https://zenquotes.io/api/random');
        
        // Check if we actually got a quote
        if (response.data && response.data.length > 0) {
            const quote = response.data[0].q; // The quote text
            const author = response.data[0].a; // Who said the quote
            const message = `"${quote}"\n- ${author}`; // Put it all together in a nice message
            
            // Send the quote to the user, using HTML for a little formatting
            await sendTranslatedMessage(bot, chatId, message, { parse_mode: 'HTML' });
        } else {
            // If the API didn't give us a quote for some reason
            await sendTranslatedMessage(bot, chatId, "Could not fetch a Zen quote at this time. Please try again later.");
        }
    } catch (error) {
        // If something went wrong with getting the quote (like no internet)
        console.error("Error fetching Zen quote:", error); // Log the error for the developer
        await sendTranslatedMessage(bot, chatId, "Sorry, there was an error getting a Zen quote."); // Tell the user
    }
};