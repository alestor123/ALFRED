var events = require('./utils/rank/rank.js');

const userDATA = require('./static/db/db.json')[7243429571]
// (async () => {
// console.log((await events("Kd-_agK8bqQ&list=PLsDH3kPvO2yyutHK9Jg1Nq5iuN1u-M0EW")))
// })();
var lol = ["4:30","5:30","22:30","03:30"]
// console.log()
// lol.sort((a) => events(a,"04:00","21:00") ? 0:-1 )
console.log(events(userDATA))