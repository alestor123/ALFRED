var axios = require('axios');
module.exports = async (username) => {
const userData = (await axios.get('https://api.github.com/repos/tech-conferences/conference-data/git/trees/main')).data
}