const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const logger = require('../utils/logging/logs');
const db = require('../schema/db');

// Load daily messages
const messagesPath = path.join(__dirname, '..', 'static', 'daily_messages.json');
let dailyMessages = {};
try {
    const rawMessages = fs.readFileSync(messagesPath, 'utf8');
    dailyMessages = JSON.parse(rawMessages);
    logger.info('Daily messages loaded successfully');
} catch (error) {
    logger.error('Failed to load daily messages:', error);
    dailyMessages = {
        excellent: ["Great job today!"],
        good: ["Good work!"],
        average: ["Keep going!"],
        needs_improvement: ["Try better tomorrow!"]
    };
}

// Helper function to get a random message based on performance
function getEndOfDayMessage(performance) {
    const category = performance.category;
    const messages = dailyMessages[category] || dailyMessages.average;
    return messages[Math.floor(Math.random() * messages.length)];
}

// Helper function to calculate performance metrics
function calculatePerformance(completedTasks, totalTasks) {
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    let category;
    if (completionRate >= 80) {
        category = 'excellent';
    } else if (completionRate >= 60) {
        category = 'good';
    } else if (completionRate >= 40) {
        category = 'average';
    } else {
        category = 'needs_improvement';
    }

    return {
        category,
        completionRate: Math.round(completionRate)
    };
}

// Helper function to format date
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Helper function to check if a task is from today
function isTaskFromToday(task) {
    try {
        const today = new Date();
        const taskDate = new Date(task.createAT);
        return taskDate.toDateString() === today.toDateString();
    } catch (error) {
        logger.error('Error checking task date:', error);
        return false;
    }
}

// Main function to generate and send daily report
async function generateDailyReport(chatId, bot) {
    try {
        // Get user data
        const userData = db.get(chatId.toString());
        if (!userData) {
            logger.error(`User not found for chat ID: ${chatId}`);
            await bot.sendMessage(chatId, '❌ Please register first using /register command.');
            return;
        }

        // Get today's date
        const today = new Date();
        const dateStr = formatDate(today);

        // Get tasks for today
        const todayTasks = userData.tasks?.filter(isTaskFromToday) || [];
        const completedTasks = todayTasks.filter(task => task.isCompleted);
        const totalTasks = todayTasks.length;

        // Calculate performance metrics
        const performance = calculatePerformance(completedTasks.length, totalTasks);

        // Get end of day message
        const endOfDayMessage = getEndOfDayMessage(performance);

        // Get LeetCode data
        const leetcodeData = userData.leetcode || {};
        const leetcodeProblems = leetcodeData.problems || [];
        const todayLeetcodeProblems = leetcodeProblems.filter(problem => {
            try {
                const problemDate = new Date(problem.solvedAt);
                return problemDate.toDateString() === today.toDateString();
            } catch (error) {
                return false;
            }
        });

        // Prepare template data
        const templateData = {
            name: userData.name || 'User',
            date: dateStr,
            taskCount: completedTasks.length,
            completedTasks: completedTasks,
            totalTasks: totalTasks,
            completionRate: performance.completionRate,
            endOfDayMessage: endOfDayMessage,
            leetcodeCount: todayLeetcodeProblems.length,
            leetcodeProblems: todayLeetcodeProblems,
            leetcodeStreak: leetcodeData.streak || 0
        };

        // Render the template
        const templatePath = path.join(__dirname, '..', 'templates', 'daily_report.ejs');
        const report = await ejs.renderFile(templatePath, templateData);

        // Send the report
        await bot.sendMessage(chatId, report, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });

        logger.info(`Daily report sent successfully to chat ID: ${chatId}`);

    } catch (error) {
        logger.error(`Error generating daily report for chat ID ${chatId}:`, error);
        await bot.sendMessage(chatId, '😔 Sorry, there was an error generating your daily report. Please try again later.');
    }
}

// Function to handle the daily report command
async function handleDailyReport(msg, bot) {
    try {
        const chatId = msg.chat.id;
        logger.info(`Daily report requested for chat ID: ${chatId}`);
        await generateDailyReport(chatId, bot);
    } catch (error) {
        logger.error(`Error in handleDailyReport: ${error.message}`);
        await bot.sendMessage(msg.chat.id, '😔 Sorry, there was an error processing your request. Please try again later.');
    }
}

module.exports = {
    handleDailyReport,
    generateDailyReport
};
