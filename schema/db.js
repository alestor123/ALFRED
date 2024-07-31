const JSONdb = require('simple-json-db'),
{resolve} = require('path'),
db = new JSONdb(resolve('../static/config/db.json')),
store = JSON.stringify(db.storage);
console.log(store)
module.exports = db