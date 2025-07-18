var db = require('../schema/db.js')
const defaultReminders = require('../static/config/reminder.json').static
var questions = require('../static/config/questions.json').main
var i = 0

var validHHMMstring = (str) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(str);

// make a time out system 
module.exports = async (msg,bot) => {
    var userDetails = {reminders:defaultReminders};
    askQuestion(questions[0].qn,msg,bot,({text},j) => {
        // if(questions[j].isTime) console.log(validHHMMstring(text))
        userDetails[questions[j].key] = text;
    if((i==questions.length-1)) {
         bot.sendMessage(msg.chat.id, `🎉 Welcome, Master ${userDetails["name"]}! Your details have been saved. `);
         db.set(msg.chat.id,userDetails)
        }
        }) 
    

}
async function askQuestion(qn,msg,bot,runFunction) {
    const namePrompt = await bot.sendMessage(msg.chat.id, qn, {
        reply_markup: {
            force_reply: true,
            input_field_placeholder: "Reply with your answer",

        },
    });
   await bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, (msg_obj) => {
    runFunction(msg_obj,i)
    if(i<questions.length && questions[i+1]) askQuestion(questions[i+1].qn,msg,bot,runFunction)
        i++;
    });
}
