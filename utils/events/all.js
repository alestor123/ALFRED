const hackclub = require('./hackclub/hackclub.js');
// const moment = require('')
module.exports = async (res) => {
    console.log(res)
    switch(res.event_type) {
 case 'hackathons' :
    try {
        const response = (await hackclub())
        const filterResponse = response.filter(e => {
            switch(res.event_time) {
            case "all":
                return true;
            break;
            }
        })
        return filterResponse
      } catch (error) {
        console.log(error);
      }
    break;
    }
    
}


// { event_type: 'all', organizer: 'meetups', mode: 'online' }