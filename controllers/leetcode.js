var db = require('../schema/db.js')
var dataFetch = require('../utils/activity/leetcode/all.js');

const { readFileSync }  = require('fs')
const { render } = require('ejs')
const { resolve } = require('path')


module.exports = async (msg,bot,args) => {
    
    const chatId = msg.chat.id;
    const messageText = msg.text;
    const arguments = args[1].split(' ')
    const leetcodeUsername =  arguments[1] || db.get(chatId).leetcode
    const userData = (await dataFetch(leetcodeUsername,chatId))
    switch (arguments[0]) {
        case 'profile':bot.sendMessage(chatId,(render(readFileSync(resolve('templates/leetcode/stats.ejs')).toString(), userData)));break;
        case 'stats':
        case 'submissions':
        case 'all':console.log('Mangoes and papayas are $2.79 a pound.');break;
        default:bot.sendMessage(chatId, "Please provide a valid argument!");
      }
      
    
}