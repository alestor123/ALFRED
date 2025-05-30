const cron = require('node-cron');
const { Task } = require('../../schema/models');
const logger = require('../logging/logs');
const moment = require('moment');

async function sendTaskReminders(bot) {
    try {
        // Find tasks with unsent reminders that are due
        const tasks = await Task.find({
            'reminders.sent': false,
            'reminders.time': { 
                $lte: new Date(),
                $gte: moment().subtract(5, 'minutes').toDate() // Only check last 5 minutes
            }
        });

        for (const task of tasks) {
            try {
                // Send reminder message
                await bot.sendMessage(
                    task.chatId,
                    `⏰ *Task Reminder*\n\n` +
                    `Your task "*${task.title}*" is due in 1 hour!\n\n` +
                    `📝 ${task.description}\n` +
                    `📅 Due: ${moment(task.dueDate).format('MMM D, YYYY HH:mm')}\n` +
                    `📊 Category: ${task.metadata.category}`,
                    { parse_mode: 'Markdown' }
                );

                // Mark reminders as sent
                await Task.findByIdAndUpdate(
                    task._id,
                    {
                        $set: {
                            'reminders.$[elem].sent': true
                        }
                    },
                    {
                        arrayFilters: [{ 'elem.sent': false }]
                    }
                );

                logger(`Sent reminder for task: ${task.title}`);
            } catch (error) {
                logger.error(`Error sending reminder for task ${task._id}: ${error.message}`);
            }
        }
    } catch (error) {
        logger.error('Task reminder error: ' + error.message);
    }
}

// Schedule reminder check every minute
const scheduleTaskReminders = (bot) => {
    cron.schedule('* * * * *', () => sendTaskReminders(bot));
    logger('Task reminder scheduler initialized');
};

module.exports = {
    scheduleTaskReminders,
    sendTaskReminders
}; 