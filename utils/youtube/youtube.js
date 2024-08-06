const {writeFileSync} = require('fs');
const { resolve, join, basename } = require('path')
const axios = require('axios')
const baseURL = "https://cdn38.savetube.me/info?url="
const tmp = require('tmp');

module.exports = async (url) => {
const tmpobj = tmp.dirSync();
    if((!url)) throw Error('Please enter a URL')
else if(!((url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)))) throw Error('Please enter a valid URL')
try {
const fetchData = (await axios.get(baseURL+url)).data
var mainINFO = fetchData
var videoINFO = fetchData.data.video_formats.find(e => e.default_selected==1)
const tempath = (join(tmpobj.name,(mainINFO.data.titleSlug+".mp4")));

writeFileSync(tempath, (await axios.get(videoINFO.url, { responseType: 'arraybuffer' })).data, err => {
    if (err) throw err
  })

return {...mainINFO,path:tempath}
}
catch(e){
    console.error(e.message)
}
}