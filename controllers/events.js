const { readFileSync }  = require('fs')
const { render } = require('ejs')
const { resolve } = require('path')

var db = require('../schema/db.js')
var tasks = require('../static/config/events.json')
var all = require('../utils/events/all.js')
var i = 0


var questions = tasks.main


// make a time out system 
module.exports = async (msg,bot) => {
    i = 0
    bot.removeListener("callback_query");
    var eventDetails = {};
    const chatID = msg.chat.id;

    askQuestion(questions[0],msg,bot,async ({text},j) => {
        eventDetails[questions[j].key] = text;
        if((i==questions.length-1)) {
        const events =  (await all(eventDetails))
        if (!Array.isArray(events) || events.length === 0) {
            bot.sendMessage(chatID, "❌ Sorry, no events found for your selection. Please try again later or try a different filter.");
            return;
        }
        console.log(events[0])
        bot.sendMessage(chatID,(render(readFileSync(resolve('templates/events/hackathons.ejs')).toString(), {events})))
           }
        
        }) 
    

}
async function askQuestion(qst,msg,bot,runFunction) {
    const namePrompt = await bot.sendMessage(msg.chat.id, qst.qn, {
        reply_markup: {
            force_reply: true,
            input_field_placeholder: "Reply with your answer",
            inline_keyboard: ((qst.type=="option") ? qst.inline_keyboard:undefined)
        },
    });
    if(i==0){
     bot.on('callback_query', async (callbackQuery) => {
        
        const callbackData = callbackQuery.data
        runFunction({text:callbackData},i)

        // if(questions[i+1].option_reply.includes(callbackData)) console.log("valid reply")
        if(i<questions.length && questions[i+1]) askQuestion(questions[i+1],msg,bot,runFunction)
        i++;
    })
}
   await bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, (msg_obj) => {
    console.log(questions[i].qn)
    runFunction(msg_obj,i)
    if(i<questions.length && questions[i+1]) askQuestion(questions[i+1],msg,bot,runFunction)
        i++;
    });
}
