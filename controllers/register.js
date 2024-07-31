var JSONdb = require('simple-json-db'),
db = new JSONdb('./store.json');

module.exports = (msg,bot) => {
    
    const chatId = msg.chat.id;
    const messageText = msg.text;
    if (messageText=="/register") ;
// console.log(chatId)
    // if (responseData[messageText]) bot.sendMessage(chatId, responseData[messageText]);
    // else bot.sendMessage(chatId, responseData["404"]);
}