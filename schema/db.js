const JSONdb = require('simple-json-db'),
{resolve,join} = require('path'),
db = new JSONdb(resolve('./static/db/db.json')),
store = JSON.stringify(db.storage);
module.exports = db
// console.log(resolve('./static/db/db.json'))