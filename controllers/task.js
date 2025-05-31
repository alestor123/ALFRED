var db = require('../schema/db.js')
var tasks = require('../static/config/task.json')
const moment = require('moment');

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
    
    // Construct dueDate
    try {
        let taskDateStr = taskDetails.task_date; // "main" or "tomorrow"
        let startTimeStr = taskDetails.startTime; // "HH:mm"

        let dueDateMoment = moment(); // Default to now

        if (taskDateStr === "main") {
            // "main" means today, so dueDateMoment is already set to today
        } else if (taskDateStr === "tomorrow") {
            dueDateMoment.add(1, 'days');
        } else {
            // Fallback or error for unexpected task_date string if necessary
            // For now, assume "main" or "tomorrow" from buttons
            // If task_date could be a DD-MM-YY string, add parsing here
            // Example: moment(taskDateStr, "DD-MM-YY")
            console.warn("Unexpected task_date:", taskDateStr, "- defaulting to today for dueDate calculation.");
        }

        if (startTimeStr && typeof startTimeStr === 'string') {
            const timeParts = startTimeStr.split(':');
            if (timeParts.length === 2) {
                const hour = parseInt(timeParts[0], 10);
                const minute = parseInt(timeParts[1], 10);
                if (!isNaN(hour) && !isNaN(minute)) {
                    dueDateMoment.set({ hour: hour, minute: minute, second: 0, millisecond: 0 });
                } else {
                    console.error("Invalid startTime format:", startTimeStr, "- defaulting time to 00:00");
                    dueDateMoment.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
                }
            } else {
                console.error("Invalid startTime format:", startTimeStr, "- defaulting time to 00:00");
                dueDateMoment.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
            }
        } else {
            console.error("Missing or invalid startTime - defaulting time to 00:00");
            dueDateMoment.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        }
        taskDetails.dueDate = dueDateMoment.toDate();
    } catch (error) {
        console.error("Error constructing dueDate:", error);
        // Fallback: set dueDate to now or handle error appropriately
        taskDetails.dueDate = new Date(); 
    }

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
        bot.sendMessage(msg.chat.id, `✅ SUCCESSFULLY ADDED TASK ! `);
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
