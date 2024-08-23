## tasks
implement load balancing vpn
implement a cache system
allow user to set quality of motivation videos
post the answer on stack overflow and issue
SHOUT OUT TO THE DUDE WHO MADE THAT API
IMPLEMENT LOGGING SYSTEM
IMPLEMENT STANDARDS
IMPLEMENT MOTIVATION AND MOTIVATION LIMIT PER DAY
PUT A DISCLAIMER ABOUT MASTER
MAKE THE MESSAGES LOOK COOLER(MOJIS)
IMPLEMENT TRY CATCH 
ADD VALIDATION
ADD PROFILE EDIT AND DELETE OPTION
‌Greetings
// SEND A GOOD MORNING AND GOOD NIGHT MESSAGES

// ask about workout

https://ytshorts.savetube.me/25-youtube-video-downloader-qwezz

https://github.com/harshitethic/telegram-youtube-downloader/blob/main/index.js
implment cron jobs
‌enquire
‌888 rule
‌Events
‌workout reminders
‌study reminders
‌gather Productivity api screen time details
‌classify the events as
‌errands
‌education
‌work
‌build a productivity graph
‌plan during break
‌motivation
https://dev.to/chrisachinga/building-a-weather-and-time-telegram-bot-using-nodejs-3ag6

```
const TelegramBot = require('node-telegram-bot-api');

const token = ' ';

const bot = new TelegramBot(token, {polling: true});

const options = {
  reply_markup: {
    keyboard: [
      [{ text: 'View lesson schedule', callback_data: 'lesson' }],
      [{ text: 'View call schedule', callback_data: 'rings' }]
    ]
  }
};


bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hello, what are you looking for?', options);
});

bot.on("callback_query", (msg) => {
  if(msg.data == "rings"){
    bot.sendPhoto(msg.chat.id, "rasp.jpg", options);
  }
});

```

ENQUIRY QUESTIONS
- TIME FOR SLEEP AND WAKE UP
- MOTIVATION YOUTUBE CHANNEL FOR SHORTS AND SET A LIMIT



DB STORE

'/tmp/tmp-443971-gKYc17SO89tl/i-do-not-care-what-others-think-of-me-motivation-peakmotivation-peakattitude.mp4
/tmp/tmp-445630-YGN0X1WW6d4F/i-do-not-care-what-others-think-of-me-motivation-peakmotivation-peakattitude.mp4



 # tasks 
[]
NAME THE TASK
TYPE OF TASK
when 
check if important and urgent
TASK PRIORITY[1 to 5]


type of task :

ACTUAL WORK
IDLE TIME
CHORES


DISPLAY TASKS:
add option for periodicity
IMPLEMENT GOALS
bot.removeListener("callback_query");
IMPLEMENT FILTER LIST
DAILY TASK 
MONTHLY TASK
BASED ON ;
SORT TASK
ALL
ACTUAL WORK
IDLE TIME
CHORES
PRIORITY
COMPLETED ,INCOMPLETE


# SERVER MAINTINNANCE TASKS : 
RESET MOTIVATION
EXAM TIME STFU
REMINDER TO DO DIFF TYPE OF TASKS 
REMINDER TO DO LEET CODE 
REMINDER TO DO RESEARCH AND NETWORK
REMINDER TO DO OSS CONTRIBUTIONS
REMINDER TO DO MARKETTING
REMINDER TO DO REVISION
REMINDER TO DO REVIEW REPORT DURING IDLE TIMES(BATHROOM,LUNCH,DINNER)
‌workout reminders
END DAY PLANNNER reminder

SET CRON REMINDER 
add leetcodereminder 
add hackathons reminder 


make a ranking system for sorting on basis of :
- Add a preferred Time for task (5)
- on basis of start time 4 
- priority index 
- on basis of due time 3
- stats
- registered order 1
- task type 


# UPDATE DELETE : 
 ADD A DELETE ALL OPTION

#  REPORT :
DAILY , MONTHLY , YEARLY 
USER STATS:
NO OF PRODUCITIVE HOURS :
LEET CODE STATS :
LEET CODE PROBLEMS SOLVED TODAY :
OPEN SOURCE CONTRIBUTIONS 
NO OF TASKS COMPLETED 
NO OF TASK REMAINS 
CLASS ATTENDANCE PERCENTAGE(ARE YOU GOING TO COLLEGE TODAY)
REVISION OF TODAYS ACTIVITY
PLAN FOR NEXT DAY
DEADLINE REMINDER 

# TASK 
ADD CLASSESS AND MEETINGS


# devents

add  https://dev.events/
https://pvs-studio.com/en/blog/events/


# EVENTS TEMPLATE
BANNER
STATS
NAME :
WEBSITE:
STARTS AT:
ENDS AT:
ORG : MLH || INDEPENDENT
IS APAC : 
ADDRESS :

GMAPS LAT&LONG


## AVAILABLITY
get the date ~~~~~~
and generate one hour one hour slots each from free time

how to remove  occupied time
- check if start time is between two times of task|| end time ~~~~


,
        {
            "qn": "When do you want your debreifing in HH:MM format : ",
            "key": "debreifingTime",
            "isTime":true
        },
        {
            "qn": "When do you want to show you producitivity stats in HH:MM format : ",
            "key": "statsTime",
            "isTime":true
        },
        {
            "qn": "When do you go to college/work in HH:MM format : ",
            "key": "departureTime",
            "isTime":true
        },
        {
            "qn": "When do you return from college/work in HH:MM format : ",
            "key": "arrivalTime",
            "isTime":true
        },
        {
            "qn": "Which all youtube channels do you prefer to recive you motivation in form of shorts : ",
            "key": "debreifingTime"
        },
        


# BUGS :
- [] JSON READ BUG
- [] MENU BUG
- [] PROMPT BUG


# fix :
- [] improve spaggeti code 
- [] add comments  
- [] run function on db updattion  
- [] run function only if specific part is updated
- []  fix menu problem
- []  fix menu problem



