## tasks
implement load balancing vpn
implement a cache system
allow user to set quality of motivation videos
post the answer on stack overflow and issue
SHOUT OUT TO THE DUDE WHO MADE THAT API
IMPLEMENT A MENU
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
bot.removeListener("callback_query");
IMPLEMENT FILTER LIST
DAILY TASK 
MONTHLY TASK
END DAY PLANNNER
BASED ON ;
SORT TASK
ALL
ACTUAL WORK
IDLE TIME
CHORES
PRIORITY
COMPLETED ,INCOMPLETE
SET CRON REMINDER 
add leetcodereminder 
add hackathons reminder 