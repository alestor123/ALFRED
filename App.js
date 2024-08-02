const telegramBot = require('node-telegram-bot-api');
const responses = require('./controllers/responses.js');
const prompt = require('./controllers/prompt.js');
const leetcode = require('./controllers/leetcode.js');




module.exports = (token) => {
const bot = new telegramBot(token, { polling: true });
// bot.on('message',(msg) => )
bot.onText(/^!.*$/, (msg) => responses(msg,bot));
bot.onText("/register", (msg) => prompt(msg,bot));
bot.onText("!leetcoe", (msg) => leetcode(msg,bot));

}