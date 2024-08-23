const telegramBot = require('node-telegram-bot-api');
const responses = require('./controllers/responses.js');
const prompt = require('./controllers/prompt.js');
const leetcode = require('./controllers/leetcode.js');
const menu = require('./controllers/menu.js');
const greetings = require('./controllers/greetings.js');
const motivation = require('./controllers/motivation.js');
const task = require('./controllers/task.js');
const fetchtask = require('./controllers/fetchtask.js');
const events = require('./controllers/events.js')
const availablity = require('./controllers/availablity.js')
const reminder = require('./controllers/reminder.js')


//  utils
const loggerjs = require('./utils/logging/logs.js')
// loggerjs.set({fsLog:true,fileName:'./static/logs/bot.log'})











module.exports = (token) => {
    const bot = new telegramBot(token, { polling: true });
    // bot.on('message',(msg) => )
reminder(bot)
greetings(bot)
bot.onText(/\/motivation/, (msg) => motivation(msg,bot));
bot.onText(/\/availablity/, (msg) => availablity(msg,bot));
bot.onText(/\/start/, (msg) => menu(msg,bot));
bot.onText(/\/events/, (msg) => events(msg,bot));
bot.onText(/\/leetcode (.+)/, (msg,arguments) => leetcode(msg,bot,arguments));
bot.onText("/register", (msg) => prompt(msg,bot));
bot.onText("/task", (msg) => task(msg,bot));
bot.onText("/getasks", (msg) => fetchtask(msg,bot));
bot.onText(/^!.*$/, (msg) => responses(msg,bot));
loggerjs('BOT IS RUNNING')

}