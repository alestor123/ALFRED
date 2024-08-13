const axios = require('axios');
module.exports = async () => {
    try {
        const response = (await axios.get('https://devent-fetch.vercel.app/api/v1/hackathons/events/hackclub')).data
        return response.map(e => {
            e.mode = (e.virtual ? 'online' : (e.hybrid ? 'hybrid': 'offline'))
            if(e.longitude && e.latitude) {
              e.gmaps = `https://maps.google.com/?q=${e.latitude},${e.longitude}`
            console.log(e.gmaps)
            }
              return e;
        })
    
        
      } catch (error) {
        console.log(error);
      }
}


