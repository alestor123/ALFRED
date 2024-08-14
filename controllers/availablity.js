const {resolve} = require('path')
const dbJSON = require('../static/db/db.json')


module.exports = async (msg,bot) => {
const chatID = msg.chat.id;
const occupiedTimeSlots = []
console.log(dbJSON[chatID].tasks)
}