var db = require('../schema/db.js')
var dataFetch = require('../utils/activity/leetcode/all.js');

const { readFileSync }  = require('fs')
const { render } = require('ejs')
const { resolve } = require('path')


module.exports = async (msg,bot,args) => {
    const arguments =  args ? args[1].split(' ') : []
    const chatId = msg.chat.id;
    const messageText = msg.text;
    const leetcodeUsername =  arguments[1] || db.get(chatId).leetcode
 try {
   const userData = (await dataFetch(leetcodeUsername,chatId))
   console.log(userData)
 if(args){
   switch (arguments[0]) {
    case 'profile':sendLeetcodeStats(bot,chatId,userData);break;
    case 'stats':
    case 'submissions':
    case 'all':console.log('all');break;
    default:bot.sendMessage(chatId, "Please provide a valid argument!");
  }
}
else sendLeetcodeStats(bot,chatId,userData);
}
catch(e) {
    console.log(e.message)
} 
}
function sendLeetcodeStats(bot,chatId,userData) {
    bot.sendMessage(chatId,(render(readFileSync(resolve('templates/leetcode/stats.ejs')).toString(), userData)));
}
