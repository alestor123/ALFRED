const { User } = require('../schema/models');
const axios = require('axios');
const logger = require('../utils/logging/logs');

async function getCoinPrice(symbol) {
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
        return response.data[symbol]?.usd;
    } catch (error) {
        logger.error(`Error fetching coin price: ${error.message}`);
        throw error;
    }
}

module.exports = async (msg, bot) => {
    try {
        const chatId = msg.chat.id;

        // Check if user exists
        const user = await User.findOne({ chatId });
        if (!user) {
            await bot.sendMessage(
                chatId,
                '❌ Please register first using /start command.'
            );
            return;
        }

        // Send initial message
        const message = await bot.sendMessage(
            chatId,
            `🪙 *Cryptocurrency Price Checker*

Available commands:
/coin btc - Check Bitcoin price
/coin eth - Check Ethereum price
/coin sol - Check Solana price

Example: /coin btc`,
            { parse_mode: 'Markdown' }
        );

        // Get coin symbol from message
        const args = msg.text.split(' ');
        if (args.length !== 2) {
            return;
        }

        const coinMap = {
            'btc': 'bitcoin',
            'eth': 'ethereum',
            'sol': 'solana'
        };

        const symbol = args[1].toLowerCase();
        const coinId = coinMap[symbol];

        if (!coinId) {
            await bot.sendMessage(
                chatId,
                '❌ Invalid coin symbol. Use btc, eth, or sol.'
            );
            return;
        }

        // Show loading message
        const loadingMsg = await bot.sendMessage(
            chatId,
            '🔄 Fetching price...'
        );

        try {
            const price = await getCoinPrice(coinId);
            if (!price) {
                throw new Error('Price not available');
            }

            await bot.editMessageText(
                `💰 *${symbol.toUpperCase()} Price*\n\n` +
                `Current price: $${price.toLocaleString()}`,
                {
                    chat_id: chatId,
                    message_id: loadingMsg.message_id,
                    parse_mode: 'Markdown'
                }
            );
        } catch (error) {
            await bot.editMessageText(
                '❌ Failed to fetch price. Please try again later.',
                {
                    chat_id: chatId,
                    message_id: loadingMsg.message_id
                }
            );
        }

    } catch (error) {
        logger.error(`Coin controller error: ${error.message}`);
        await bot.sendMessage(
            msg.chat.id,
            '❌ An error occurred. Please try again later.'
        );
    }
}; 