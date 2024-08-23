const format = 'hh:mm';
const moment = require('moment')
module.exports = (time,userDATA,duration,date) => {
    const intDuration = parseInt(duration)
    // check if start time is in the time slot check if end time i in the same time slot
   const { wakeupTime,bedTime } = userDATA;
//    console.log(date)
   const occupiedList = time.filter(e =>  e.date==date );
   console.log(wakeupTime.split(":")[1])

// console.log(occupiedList)
const timeSLOTS =[];
const stdWakeUpTime  = addSS(wakeupTime)
const stdBedTime  = addSS(bedTime)
// for loop to add 1 to wake up time and keep checking if it is occupied
const wakeHR = parseInt(wakeupTime.split(":")[0])
const hrLimit = parseInt(bedTime.split(":")[0])

for(var i = (wakeHR);i<hrLimit;i+=intDuration) {
    const stdAllotment = ((i+intDuration).toString()+":"+ wakeupTime.split(":")[1])
    timeSLOTS.push({ startAllot:(((i).toString()+":"+ wakeupTime.split(":")[1])),endAllot:stdAllotment })

}
var fullSlots = uniqueObjects(timeSLOTS)
var final = fullSlots.filter(({startAllot,endAllot}) => {
    const beforeTime = moment(startAllot, format);
    const afterTime = moment(endAllot, format);
console.log(beforeTime)
    var isIncluded;
occupiedList.forEach(({ end,start }) => {
    const timeStart = moment(start, format);
    const timeEND = moment(end, format);
// console.log(!(timeStart.isBetween(beforeTime, afterTime) || (timeEND.isBetween(beforeTime, afterTime))))
// console.log(timeStart)
if(!(timeStart.isBetween(beforeTime, afterTime) || (timeEND.isBetween(beforeTime, afterTime)))) isIncluded = true;
})


/*
   
       
        // console.log({ start:(((i).toString()+":"+ wakeupTime.split(":")[1])),end:stdAllotment })
        // console.log(!(timeStart.isBetween(beforeTime, afterTime) || (timeEND.isBetween(beforeTime, afterTime))))
        // if (!(timeStart.isBetween(beforeTime, afterTime) || (timeEND.isBetween(beforeTime, afterTime)))) 
        timeSLOTS.push({ start:(((i).toString()+":"+ wakeupTime.split(":")[1])),end:stdAllotment })
    
*/

return isIncluded;
})
return final;

}
function addSS(time) {
    return time+":00"
}
function uniqueObjects(objs) {
   return [...(new Map(objs.map(c => [c.start, c]))).values()];  
}