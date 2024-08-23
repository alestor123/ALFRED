
const { readFileSync }  = require('fs')
const { render } = require('ejs')
const {resolve} = require('path')
const dbJSON = require('../static/db/db.json')
const availablity = require('../utils/timeslots/available.js')
var questions = require('../static/config/avail.json').main
var i = 0;

module.exports = async (msg,bot) => {
const chatID = msg.chat.id;
var availDetails = {};
askQuestion(questions[0].qn,msg,bot,({text},j) => {
    // if(questions[j].isTime) console.log(validHHMMstring(text))
    availDetails[questions[j].key] = text;
if((i==questions.length-1)) {
    const  userDetails = dbJSON[chatID];
     bot.sendMessage(msg.chat.id, `Checking the schedule ....`);
        const occupiedTimeSlots = userDetails.tasks.filter(task => (compareDates(task.task_date)>=compareDates(todaysDate()))).map(task =>  { 
            return {
                start:task.startTime , 
                end:task.endTime , 
                date:task.task_date
            } 
        } )
        const occupiedList =  [...new Set((occupiedTimeSlots))];
        const allotedList = availablity(occupiedList,userDetails,availDetails.hours,availDetails.date)
try {
     bot.sendMessage(msg.chat.id, (render(readFileSync(resolve('templates/availability/avail.ejs')).toString(), {allotedList})));
    }
    catch(e){
        console.error(e.message)
    }
    }
    }) 


}
function groupByDate(arr) {
return arr.reduce((x, y) => {

    (x[y.date] = x[y.date] || []).push(y);

    return x;

}, {});
}

// function availableSlots(hours,arr) {
// return arr.sort(etime => {
//     return ()
// })
// }

function compareDates(date) {
var parts = date.split("-");
return new Date(parts[2], parts[1] - 1, parts[0]);
}
function todaysDate() { 
var arrDate =   (new Date()).toLocaleDateString().split('/')
return [arrDate[1],arrDate[0],arrDate[2]].join('-')

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
