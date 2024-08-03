var db = require('../schema/db.js')
const cron = require('node-cron');
const dbJSON = require('../static/db/db.json')
const {goodMorning,goodNight} = require('../static/config/questions.json')


module.exports = async (bot) => {


for(var chatId in dbJSON){
var bedTime = (db.get(chatId).bedTime.replaceAll(' ','').split(':'))
var morningTime = (db.get(chatId).wakeupTime.replaceAll(' ','').split(':'))

   
   const scheduleMorning = cron.schedule(`${morningTime[1]} ${morningTime[0]} * * *`, async () => {
    bot.sendMessage(chatId, goodMorning);
})

    const scheduleNight = cron.schedule(`${bedTime[1]} ${bedTime[0]} * * *`, async () => {
        bot.sendMessage(chatId, goodNight);
})

}

}
const validHHMMstring = (str) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(str);
