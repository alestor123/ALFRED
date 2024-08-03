var db = require('../schema/db.js')

const { readFileSync }  = require('fs')
const { render } = require('ejs')
const { resolve } = require('path')


module.exports = (msg,bot) => {
const chatId = msg.chat.id;
const userData = db.get(chatId)
userData["chatID"] = chatId;
bot.sendMessage(chatId,(render(readFileSync(resolve('templates/profile/profile.ejs')).toString(), userData)));
}