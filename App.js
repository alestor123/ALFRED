const telegramBot = require('node-telegram-bot-api');
const responses = require('./controllers/responses.js');
const prompt = require('./controllers/prompt.js');



module.exports = (token) => {
const bot = new telegramBot(token, { polling: true });
// bot.on('message',(msg) => )
bot.onText(/^!.*$/, (msg) => responses(msg,bot));
bot.onText("/register", (msg) => prompt(msg,bot));
}