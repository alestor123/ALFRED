var axios = require('axios');
module.exports = async (username) => {
if((!username)) throw Error('Please enter a valid username')
const submissionData = (await axios.get(`https://alfa-leetcode-api.onrender.com/${username}/solved`)).data
return submissionData;
}