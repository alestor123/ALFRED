const responseData = require('../static/reponses/main.json')
module.exports = (msg,bot) => {
    const chatId = msg.chat.id;
    const messageText = msg.text.replace('!','');
console.log(chatId)
    if (responseData[messageText]) bot.sendMessage(chatId, responseData[messageText]);
    else bot.sendMessage(chatId, responseData["404"]);
}