var db = require('../schema/db.js')

const { readFileSync }  = require('fs')
const { render } = require('ejs')
const { resolve } = require('path')
const rank = require('../utils/rank/rank.js');
var userDATA;

module.exports = (msg,bot) => {
bot.removeListener("callback_query");
const chatId = msg.chat.id;
userDATA = db.get(chatId);
const tasks = rank(userDATA)

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
async function sendMessage(bot,chatID,tasks) {
const msgPrompt = await bot.sendMessage(chatID,(render(readFileSync(resolve('templates/tasks/current.ejs')).toString(), {tasks})),{
  reply_markup: {
      force_reply: true,
      input_field_placeholder: "Reply with your answer",

  },
});
await bot.onReplyToMessage(chatID, msgPrompt.message_id, (msg_obj) => {
  if(msg_obj.text.toLowerCase().split(' ')[0]=="delete") {
   const arr = msg_obj.text.toLowerCase().split(' ')[1].split(',')
    console.log("delete command")
    arr.forEach(e => {
    tasks.splice(((Number(e)-1)),1)
    bot.sendMessage(chatID,`TASK NO ${e} HAS BEEN DELETED !!`)
    })
    userDATA.tasks= (tasks)
    db.set(chatID,userDATA)
  
  }
    else {
    msg_obj.text.split(',').forEach((e) => {
      tasks[((Number(e)-1))].isCompleted = !tasks[((Number(e)-1))].isCompleted
      userDATA.tasks = tasks;
      db.set(chatID,userDATA)
      bot.sendMessage(chatID,`TASK NO ${e} HAS BEEN MARKED ${ tasks[((Number(e)-1))].isCompleted ? "COMPLETED" : "INCOMPLETE" } !!`)
    })
  }
  })
}