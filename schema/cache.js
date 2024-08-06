const JSONdb = require('simple-json-db'),
{resolve,join} = require('path'),
db = new JSONdb(resolve('./static/db/cache.json')),
store = JSON.stringify(db.storage);
module.exports = db
