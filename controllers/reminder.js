
var db = require('../schema/db.js')
const chokidar = require('chokidar');
const dbJSON = require('../static/db/db.json');
const cron = require('node-cron');
const watcher = chokidar.watch('static/db/db.json', {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });

module.exports = async (bot) => {
    reminderRUN(bot)
    watcher
    .on('change', path => reminderRUN(bot))
}
function reminderRUN(bot) {
    for(var chatId in dbJSON){
var bedTime = (db.get(chatId).reminders.forEach(({message,time}) => {
const [hh,mm] = time.split(':');
cron.schedule(`${mm} ${hh} * * *`, async () => {
    bot.sendMessage(chatId, message);
})           
}))         
}
}