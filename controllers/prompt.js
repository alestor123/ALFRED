const storage = {}
var questions = [{qn:"What is your name : ",key:"fullname"},{qn:"What is your first name : ",key:"fullname"}]
var i = 0

// make a time out system 
module.exports = async (msg,bot) => {
    askQuestion(questions[0].qn,msg,bot,({text}) => {
        // console.log(text)
    if((i==questions.length-1)) bot.sendMessage(msg.chat.id, `Welome master ${text} `);
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
    runFunction(msg_obj)
    if(i<questions.length && questions[i+1]) askQuestion(questions[i+1].qn,msg,bot,runFunction)
    i++
   });
}
