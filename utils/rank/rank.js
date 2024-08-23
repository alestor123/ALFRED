var between = require('../time/between.js');

module.exports =  (userDATA) => {
const {tasks,mainPrefTime,hustlePrefTime,chorePrefTime,goalPrefTime,idlePrefTime} = userDATA;
var sortedTASKS = [];
const leftOverTASKS = [];

tasks.forEach(e => {
  switch(e.task_type)
  {
    case "main":
        
    if(between(e.endTime,mainPrefTime.split('-')[0],mainPrefTime.split('-')[1])) sortedTASKS.push(e)
    break;
    case "side_hustle":
    if(between(e.endTime,hustlePrefTime.split('-')[0],hustlePrefTime.split('-')[1])) sortedTASKS.push(e)
        
    break;
    case "idle":
        if(between(e.endTime,idlePrefTime.split('-')[0],idlePrefTime.split('-')[1])) sortedTASKS.push(e)

    break;
    case "chores":
        if(between(e.endTime,chorePrefTime.split('-')[0],chorePrefTime.split('-')[1])) sortedTASKS.push(e)
    
    break;
    case "goals":
        if(between(e.endTime,goalPrefTime.split('-')[0],goalPrefTime.split('-')[1])) sortedTASKS.push(e)    
    break;
        default:
            leftOverTASKS.push(e)
  }
    // if(between(e,"04:00","21:00")) sortedTASKS.push(e)
})
sortedTASKS = (sortedTASKS.concat(leftOverTASKS))
sortedTASKS.sort((a,b) => (a.time+":00").localeCompare((b.time+":00")));

return sortedTASKS
}