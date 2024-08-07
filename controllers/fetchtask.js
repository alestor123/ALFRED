var db = require('../schema/db.js')

const { readFileSync }  = require('fs')
const { render } = require('ejs')
const { resolve } = require('path')
const rank = require('../utils/rank/rank.js');


module.exports = (msg,bot) => {
bot.removeListener("callback_query");
const chatId = msg.chat.id;
const tasks = rank(db.get(chatId))
bot.sendMessage(
    chatId,
    "FETCH TASKS :",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'ALL', callback_data: 'all' }],
          [{ text: 'COMPLETED', callback_data: 'fetch_completed' }],
          [{ text: 'INCOMPLETE', callback_data: 'fetch_incomplete' }],
          [{ text: 'MAIN', callback_data: 'fetch_main' }],
          [{ text: 'SIDE HUSTLE', callback_data: 'fetch_side_hustle' }],
          [{ "text": "IDLE", "callback_data": "fetch_idle" }],
          [{ "text": "CHORES", "callback_data": "fetch_chores" }],
          [{ "text": "GOALS", "callback_data": "fetch_goals" }],

        ],
      },
    })
    bot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id
        const data = callbackQuery.data
        switch (data) {
         
            case 'all': 
            sendMessage(bot,chatId,tasks)
            // bot.sendMessage(chatId,(render(readFileSync(resolve('templates/tasks/current.ejs')).toString(), {tasks})));
            break; 
            case 'fetch_completed': 
            sendMessage(bot,chatId,tasks.filter(e => e.isCompleted))
            break; 
            case 'fetch_incomplete': 
            sendMessage(bot,chatId,tasks.filter(e => !e.isCompleted))
            break; 
            case 'fetch_main': 
            sendMessage(bot,chatId,tasks.filter(e => e.task_type =="main"))
            break; 
            case 'fetch_side_hustle': 
            sendMessage(bot,chatId,tasks.filter(e => e.task_type =="side_hustle"))
            break; 
            case 'fetch_idle': 
            sendMessage(bot,chatId,tasks.filter(e => e.task_type =="idle"))
            break; 
            case 'fetch_chores': 
            sendMessage(bot,chatId,tasks.filter(e => e.task_type =="chores"))
            break; 
                case 'fetch_goals': 
                sendMessage(bot,chatId,tasks.filter(e => e.task_type =="goals"))
                break;
            default:
            break
        }
      })
}
function sendMessage(bot,chatID,tasks) {
    bot.sendMessage(chatID,(render(readFileSync(resolve('templates/tasks/current.ejs')).toString(), {tasks})));

}