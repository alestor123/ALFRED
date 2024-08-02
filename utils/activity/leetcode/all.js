var axios = require('axios');
var getUserData = require('./profile.js');
var getStats = require('./stats.js');
var getSubmissions = require('./submissions.js');

module.exports = async (username) => {
    if((!username)) throw Error('Please enter a valid username')
var  UserData = await getUserData(username,'21212112')
var  stats = await getStats(username,'21212112')
var  submissions = await getSubmissions(username,'21212112')


return {...UserData,stats,submissions};
}