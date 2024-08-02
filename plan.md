## tasks

post the answer on stack overflow and issue
SHOUT OUT TO THE DUDE WHO MADE THAT API
IMPLEMENT LOGGING SYSTEM
IMPLEMENT STANDARDS
IMPLEMENT MOTIVATION AND MOTIVATION LIMIT PER DAY



‌Greetings
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