const {resolve} = require('path')
var db = require('../schema/db.js')
var youtubeShorts = require('../utils/youtube/youtube.js');
const randomVideo = require('../utils/youtube/randomVideo.js');
const { sync } = require('rimraf')
const dbJSON = require('../static/db/db.json')


module.exports = async (msg,bot) => {
    const chatId = msg.chat.id;
    if(dbJSON[chatId].motivationChannelID) {
        if(dbJSON[chatId].motivationLimit >= dbJSON[chatId].motivationCount) {

    console.log(dbJSON[chatId].motivationCount)
    dbJSON[chatId].motivationCount++;
    db.set(chatId,dbJSON[chatId])
    const videoURL =  (await randomVideo(dbJSON[chatId].motivationChannelID))
    const videoPath =  (await youtubeShorts(videoURL)).path
    console.log(videoPath)
    bot.sendVideo(chatId,(videoPath)).then(() => {
        sync(videoPath)
        console.log('deleted!!!')
    });
    

}
else bot.sendMessage(chatId, "Sorry you have exceeded daily motivation limit");
}
else bot.sendMessage(chatId, "Sorry you have not set the motivation channel ID");
}