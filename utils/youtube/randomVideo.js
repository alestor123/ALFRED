// 
var axios = require('axios');
module.exports = async (id) => {
    if((!id)) throw Error('Please enter a id username')
const baseURL = 'https://www.youtube.com/watch?v='
const playlistData = (await axios.get('https://aiotube.deta.dev/playlist/'+id)).data.videos
const randomVideoID = playlistData[Math.floor(Math.random()*playlistData.length)]
return (baseURL+randomVideoID)
}