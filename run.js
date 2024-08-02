var events = require('./utils/activity/leetcode/all.js');
(async () => {
console.log((await events('alestor123','21212112')).submissions)
})();
// const { render } = require('ejs')
// const { readFileSync }  = require('fs')
//  const { resolve } = require('path')
// console.log(readFileSync(resolve(__dirname, 'templates/leetcode/stats.ejs')).toString())
