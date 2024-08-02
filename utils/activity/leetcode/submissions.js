var axios = require('axios');
module.exports = async (username,chatID) => {
if((!username)) throw Error('Please enter a valid username')
const submissionData = (await axios.get(`https://alfa-leetcode-api.onrender.com/${username}/acSubmission`)).data
const problemsSolvedToday = [];
submissionData.submission.map(subs => {
if(sameDay(subs.timestamp)) {
    submissionData["isSolvedToday"] = true;
    problemsSolvedToday.push(subs) 
}
    return subs["isToday"] = sameDay(subs.timestamp)

})
submissionData["countToday"] = problemsSolvedToday.length
submissionData["problemsSolvedToday"] = problemsSolvedToday
return submissionData
}
function sameDay(ts) {
var today = new Date().setHours(0, 0, 0, 0);
var thatDay = new Date(ts*1000).setHours(0, 0, 0, 0);

return (today === thatDay)
}