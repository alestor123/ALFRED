var db = require('../../schema/cache.js')
module.exports =  ({id,key,tempPathtitleSlug,url}) => {
    db.set(id,{id,key,tempPath,titleSlug,url,createdAt:Date.now()})
}

/*
id 
key 
title title slug
createdAt
expiry

*/