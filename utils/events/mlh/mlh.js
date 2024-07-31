var ray = require('x-ray')(),
{ readFileSync } = require('fs')
axios = require('axios'),
eventss = [];
module.exports = async () => {
    try {
        const response = await axios.get('https://mlh.io/seasons/2024/events', { withCredentials: true });
        console.log(response.data);
      } catch (error) {
        console.log(error);
      }
var html = (readFileSync('./download.html').toString())
var data = await ray('https://mlh.io/seasons/2024/events', '.event', [{title: '.event-link@title',date:'.event-date',url: '.event-link@href'}]).then(res => res) 
data.forEach(events => {
events['isMlh']=events.url.includes('mlh.io')
eventss.push(events)
})
return eventss
}


