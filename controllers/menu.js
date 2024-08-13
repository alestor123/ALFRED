var db = require('../schema/db.js')
const prompt = require('./prompt.js');
const leetcode = require('./leetcode.js');
const profile = require('./profile.js');
const responses = require('../static/reponses/main.json');
const motivation = require('./motivation.js');
const task = require('./task.js');
const fetchtask = require('./fetchtask.js');
const events = require('./events.js');


module.exports = async (msg,bot) => {
    const chatId = msg.chat.id
    const name = db.get(chatId).name
    bot.removeListener("callback_query");
    bot.sendMessage(
      chatId,
      `Welcome, Master ${name || ""}! I'm Alfred Pennyworth, your trusted butler and productivity assistant. I'll help you stay on top of your tasks, manage your time, and achieve your goals. \n PLEASE CHOOSE AN OPTION BELOW:`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'REGISTER', callback_data: 'register' }],
            [{ text: 'PROFILE', callback_data: 'profile' }],
            [{ text: 'LEETCODE STATUS', callback_data: 'leetcode' }],
            [{ text: 'DAILY REPORT', callback_data: 'dailyreport' }],
            [{ text: 'TODAYS TASK', callback_data: 'currenttask' }],
            [{ text: 'ADD TASK', callback_data: 'addtask' }],
            [{ text: 'EVENTS', callback_data: 'events' }],
            [{ text: 'AVAILABLITY', callback_data: 'availablity' }],
            [{ text: 'PROJECTS', callback_data: 'projects' }],
            [{ text: 'SILENCE', callback_data: 'silence' }],
            [{ text: 'MOTIVATION', callback_data: 'motivation' }],
            [{ text: 'SETTINGS', callback_data: 'settings' }],
            [{ text: 'UPDATES', callback_data: 'updates' }],
            [{ text: 'ABOUT', callback_data: 'about' }],
          ],
        },
      }
    )
    bot.on('callback_query', async (callbackQuery) => {

        const chatId = callbackQuery.message.chat.id
        const data = callbackQuery.data
        switch (data) {
          case 'register':
            bot.sendMessage(chatId, "Thanks for joining, Master! I'm here to help you stay productive and achieve your goals. You me send your answer as a reply for the following questions").then(() => {
                prompt(msg,bot)
            }); 
            break;
            case 'leetcode':
            leetcode(msg,bot)
                break;
            case 'profile': 
            profile(msg,bot)
            break; 
            case 'motivation': 
            motivation(msg,bot)
            break; 
            case 'addtask': 
            task(msg,bot)
            break; 
            case 'currenttask': 
            fetchtask(msg,bot)
            break; 
            case 'events': 
            events(msg,bot)
            break;
                case 'about': 
            bot.sendMessage(chatId,responses.static.about)
            break;
            default:
            break
        }
      })
}