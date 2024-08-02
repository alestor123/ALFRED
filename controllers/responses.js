const responseData = require('../static/reponses/main.json')
module.exports = (msg,bot) => {
    const chatId = msg.chat.id;
    const messageText = msg.text.replace('!','');
console.log(chatId)
    if (responseData.static[messageText]) bot.sendMessage(chatId, responseData[messageText]);
    else if(responseData.dynamic.includes(messageText)) console.log("FUNCTION IS RUNNNING")
    else bot.sendMessage(chatId, responseData["404"]);
}