const cron = require('node-cron');
const { Task, User } = require('../../schema/models');
const logger = require('../logging/logs');
const moment = require('moment');

async function sendTaskReminders(bot) {
    try {
        // Find tasks due in the next 10 minutes, not already reminded
        const now = new Date();
        const tenMinsLater = moment(now).add(10, 'minutes').toDate();
        const tasks = await Task.find({
            'reminders.sent': false,
            dueDate: { $gte: now, $lte: tenMinsLater }
        });

        for (const task of tasks) {
            try {
                // Check if user has muted reminders
                const user = await User.findOne({ chatId: String(task.chatId) });
                if (user?.settings?.isSilenced) {
                    logger(`Reminders muted for user ${task.chatId}, skipping reminder for task: ${task.title}`);
                    continue;
                }
                // Ensure required fields are present and non-empty
                if (!task.title || typeof task.title !== 'string' || !task.title.trim() ||
                    !task.description || typeof task.description !== 'string' || !task.description.trim() ||
                    !task.dueDate || isNaN(new Date(task.dueDate))) {
                    logger(`Skipping reminder for task with missing or invalid fields: ${JSON.stringify(task)}`);
                    continue;
                }
                // Calculate minutes left
                const minsLeft = Math.round((new Date(task.dueDate) - now) / 60000);
                let timeMsg = minsLeft <= 1 ? 'is due now!' : `is due in ${minsLeft} minutes!`;
                const message =
                    `⏰ *Task Reminder*\n\n` +
                    `Your task "*${task.title}*" ${timeMsg}\n\n` +
                    `📝 ${task.description}\n` +
                    `📅 Due: ${moment(task.dueDate).format('MMM D, YYYY HH:mm')}\n` +
                    `📊 Category: ${task.metadata?.category || ''}`;
                // Final check: skip if message is empty or only whitespace
                if (!message || typeof message !== 'string' || !message.replace(/\s/g, '').length) {
                    logger(`Skipping reminder: constructed message is empty for task: ${JSON.stringify(task)}`);
                    continue;
                }
                // Send reminder message
                await bot.sendMessage(
                    task.chatId,
                    message,
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