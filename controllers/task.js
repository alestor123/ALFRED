var db = require('../schema/db.js')
var tasks = require('../static/config/task.json')

var questions = tasks.main
var i = 0


// make a time out system 
module.exports = async (msg,bot) => {
    bot.removeListener("callback_query");
    var taskDetails = {isCompleted:false};
 
    askQuestion(questions[0],msg,bot,({text},j) => {
        taskDetails[questions[j].key] = text;
    if((i==questions.length-1)) {
    taskDetails["important"] = taskDetails["important"]=="yes" ? 0:1
    taskDetails["urgent"] = taskDetails["urgent"]=="yes"  ? 0:1
    taskDetails["stats"] = tasks.matrix[taskDetails["important"]][taskDetails["urgent"]]
    taskDetails["priorityIndex"] = tasks.priority_index.indexOf(taskDetails.priority);
    // eisenhower stats
    // IMP YES
    // URGENT NOW
    if(!db.get(msg.chat.id).tasks) db.set(msg.chat.id,{...db.get(msg.chat.id),tasks:[taskDetails]})    
    else {
const currentTaskArray = (db.get(msg.chat.id).tasks)
const currentUserData = db.get(msg.chat.id);
taskDetails["createAT"] = Date.now();
currentTaskArray.push(taskDetails)
currentUserData.tasks = currentTaskArray
db.set(msg.chat.id,currentUserData)
    }
        bot.sendMessage(msg.chat.id, `SUCESSFULLY ADDED TASK ! `);
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
        console.log(questions[i].qn)
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
