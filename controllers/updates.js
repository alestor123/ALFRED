const { scrapeKTUAnnouncements } = require('../utils/scraper/ktu');
const { Cache, User } = require('../schema/models');
const ejs = require('ejs');
const path = require('path');
const logger = require('../utils/logging/logs');
const moment = require('moment');

const CACHE_KEY = 'ktu_announcements';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function getCachedAnnouncements() {
    const cache = await Cache.findOne({ key: CACHE_KEY });
    
    if (cache && moment(cache.expiresAt).isAfter(moment())) {
        return cache.value;
    }
    return null;
}

async function cacheAnnouncements(announcements) {
    await Cache.findOneAndUpdate(
        { key: CACHE_KEY },
        {
            key: CACHE_KEY,
            value: announcements,
            expiresAt: moment().add(CACHE_TTL, 'milliseconds')
        },
        { upsert: true }
    );
}

module.exports = async (msg, bot) => {
    const chatId = msg.chat.id;
    let loadingMessage;

    try {
        // Check if user exists
        const user = await User.findOne({ chatId });
        if (!user) {
            await bot.sendMessage(
                chatId,
                '❌ Please register first using /start command.'
            );
            return;
        }

        // Send loading message
        loadingMessage = await bot.sendMessage(
            chatId,
            "🔄 Fetching latest announcements..."
        );

        logger('Starting announcement fetch for chat ID: ' + chatId);

        // Try to get cached announcements
        let announcements = await getCachedAnnouncements();
        let fromCache = true;

        if (!announcements) {
            // If no cache or expired, fetch fresh announcements
            announcements = await scrapeKTUAnnouncements();
            fromCache = false;

            if (announcements && announcements.length > 0) {
                // Cache the new announcements
                await cacheAnnouncements(announcements);
            }
        }

        if (!announcements || announcements.length === 0) {
            await bot.editMessageText(
                "❌ Unable to fetch announcements at the moment. Please try again later.",
                {
                    chat_id: chatId,
                    message_id: loadingMessage.message_id
                }
            );
            return;
        }

        // Render EJS template
        const templatePath = path.join(__dirname, '..', 'templates', 'announcement.ejs');
        logger('Using template path: ' + templatePath);
        
        const message = await ejs.renderFile(templatePath, { 
            announcements,
            fromCache
        });
        logger('Template rendered successfully');

        // Send the formatted message
        await bot.editMessageText(message, {
            chat_id: chatId,
            message_id: loadingMessage.message_id,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '🔄 Refresh',
                        callback_data: 'refresh_announcements'
                    }]
                ]
            }
        });
        logger('Message sent successfully');

    } catch (error) {
        logger.error('Error in updates controller: ' + error.message);
        logger.error('Stack trace: ' + error.stack);

        let errorMessage;
        if (error.message.includes('unable to verify')) {
            errorMessage = "❌ Unable to connect to KTU website securely. Please try again later.";
        } else if (error.message === 'No announcements found on the page') {
            errorMessage = "❌ No announcements are currently available on the KTU website. Please try again later.";
        } else {
            errorMessage = "❌ An error occurred while fetching announcements. The KTU website might be temporarily unavailable.";
        }

        if (loadingMessage) {
            await bot.editMessageText(errorMessage, {
                chat_id: chatId,
                message_id: loadingMessage.message_id
            });
        } else {
            await bot.sendMessage(chatId, errorMessage);
        }
    }
}; 