var db = require('../schema/db.js'); // Our old way of saving things (using a JSON file based DB)
var tasksConfig = require('../static/config/task.json'); // Configuration for task questions and matrix
const moment = require('moment'); // A library to help with dates and times

var questions = tasksConfig.main; // Get the list of questions to ask from the config
var currentQuestionIndex = 0; // Keep track of which question we are asking, STARTING AT 0 (important for arrays!)

// This is the main function for adding a new task
module.exports = async (msg, bot) => {
    bot.removeListener("callback_query"); // Make sure no old button listeners are active
    var taskDetails = { isCompleted: false }; // Start with an empty object to store task details, and mark it as not completed
    currentQuestionIndex = 0; // Reset question index for each new task command

    // Start asking the questions one by one
    askNextQuestion(questions[currentQuestionIndex], msg, bot, (answer, questionIndex) => {
        // This function is called after each question is answered
        taskDetails[questions[questionIndex].key] = answer.text; // Store the answer using the 'key' from the config

        // Check if we have asked all the questions
        if (currentQuestionIndex === questions.length - 1) {
            // All questions answered, now process and save the task
            
            // Convert "yes"/"no" for important/urgent to 0 or 1 for the matrix
            taskDetails["important"] = taskDetails["important"] === "yes" ? 0 : 1; // 0 for yes, 1 for no
            taskDetails["urgent"] = taskDetails["urgent"] === "yes" ? 0 : 1;     // 0 for yes, 1 for no
            
            // Get the Eisenhower matrix category (e.g., "Do", "Decide")
            taskDetails["stats"] = tasksConfig.matrix[taskDetails["important"]][taskDetails["urgent"]];
            // Get a numerical index for priority (e.g., "High" -> 0, "Medium" -> 1)
            taskDetails["priorityIndex"] = tasksConfig.priority_index.indexOf(taskDetails.priority);
            
            // Figure out the due date and time for the task
            try {
                let taskDateStr = taskDetails.task_date; // This comes from a button, like "main" (today) or "tomorrow"
                let startTimeStr = taskDetails.startTime; // This is the time like "13:30"

                let dueDateMoment = moment(); // Start with right now as a base

                if (taskDateStr === "main") {
                    // "main" means today, so we don't need to change the date part
                } else if (taskDateStr === "tomorrow") {
                    dueDateMoment.add(1, 'days'); // Add one day for tomorrow
                } else {
                    // If it's not "main" or "tomorrow", maybe it's a specific date string.
                    // For now, we'll just log a warning and use today.
                    // If you want to type dates like "25-12-2023", you'd add more logic here.
                    console.warn("Unexpected task_date:", taskDateStr, "- defaulting to today for dueDate calculation.");
                }

                // Now add the time part
                if (startTimeStr && typeof startTimeStr === 'string') {
                    const timeParts = startTimeStr.split(':'); // Split "HH:mm" into HH and mm
                    if (timeParts.length === 2) {
                        const hour = parseInt(timeParts[0], 10);
                        const minute = parseInt(timeParts[1], 10);
                        if (!isNaN(hour) && !isNaN(minute)) { // Check if they are valid numbers
                            dueDateMoment.set({ hour: hour, minute: minute, second: 0, millisecond: 0 }); // Set the hour and minute
                        } else {
                            // If the time format is bad, log an error and default to midnight
                            console.error("Invalid startTime format (not numbers):", startTimeStr, "- defaulting time to 00:00");
                            dueDateMoment.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
                        }
                    } else {
                        // If the time format is bad (e.g., no colon or wrong parts), log an error and default to midnight
                        console.error("Invalid startTime format (no colon or wrong parts):", startTimeStr, "- defaulting time to 00:00");
                        dueDateMoment.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
                    }
                } else {
                    // If no start time was given, log an error and default to midnight
                    console.error("Missing or invalid startTime - defaulting time to 00:00");
                    dueDateMoment.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
                }
                taskDetails.dueDate = dueDateMoment.toDate(); // Convert the moment object to a normal JavaScript Date
            } catch (error) {
                console.error("Error constructing dueDate:", error);
                taskDetails.dueDate = new Date(); // If something went really wrong, just use the current date and time
            }

            taskDetails["createdAt"] = Date.now(); // Record when the task was created

            // Save the task to our simple JSON database
            // This part is a bit old-style, a real database (like MongoDB) is usually better
            const userData = db.get(msg.chat.id) || {}; // Get existing user data or an empty object
            if (!userData.tasks) { // If the user has no tasks array yet
                userData.tasks = [taskDetails]; // Create one with this task
            } else {
                userData.tasks.push(taskDetails); // Add this task to their existing list
            }
            db.set(msg.chat.id, userData); // Save the updated user data back to the JSON file

            bot.sendMessage(msg.chat.id, `✅ SUCCESSFULLY ADDED TASK ! `); // Tell the user it's done
        }
    });
};

// This function asks a single question and waits for an answer (either text or button click)
async function askNextQuestion(questionConfig, originalMessage, bot, onAnswerReceived) {
    // Send the question to the user
    const questionMessage = await bot.sendMessage(originalMessage.chat.id, questionConfig.qn, {
        reply_markup: {
            force_reply: (questionConfig.type !== "option"), // Show a reply box if it's not a button question
            input_field_placeholder: "Reply with your answer", // Hint text in the reply box
            // Show buttons if the question type is "option" and buttons are defined
            inline_keyboard: ((questionConfig.type === "option" && questionConfig.inline_keyboard) ? questionConfig.inline_keyboard : undefined)
        },
    });

    // If it's a question with buttons (options)
    if (questionConfig.type === "option") {
        // Listen for a button click (callback_query)
        const callbackListener = async (callbackQuery) => {
            // Make sure this button click is for the question we just asked and from the right user
            if (callbackQuery.message && callbackQuery.message.message_id === questionMessage.message_id && callbackQuery.message.chat.id === originalMessage.chat.id) {
                bot.removeListener("callback_query", callbackListener); // Stop listening for this button click now that we have it
                bot.removeListener("message", replyListener); // Also remove the text reply listener

                onAnswerReceived({ text: callbackQuery.data }, currentQuestionIndex); // Send the answer (button data) back

                currentQuestionIndex++; // Move to the next question index
                if (currentQuestionIndex < questions.length) { // If there are more questions
                    askNextQuestion(questions[currentQuestionIndex], originalMessage, bot, onAnswerReceived); // Ask the next one
                }
            }
        };
        bot.on('callback_query', callbackListener);
        
        // Also set up a listener for text replies, in case they type instead of clicking a button (though less ideal for button questions)
        const replyListener = async (replyMsg) => {
             if (replyMsg.reply_to_message && replyMsg.reply_to_message.message_id === questionMessage.message_id && replyMsg.chat.id === originalMessage.chat.id) {
                bot.removeListener("message", replyListener); // Stop listening for this text reply
                bot.removeListener("callback_query", callbackListener); // Also remove the button click listener

                onAnswerReceived(replyMsg, currentQuestionIndex); // Send the answer (text) back

                currentQuestionIndex++; // Move to the next question index
                if (currentQuestionIndex < questions.length) { // If there are more questions
                    askNextQuestion(questions[currentQuestionIndex], originalMessage, bot, onAnswerReceived); // Ask the next one
                }
            }
        };
        bot.on('message', replyListener); // Using 'message' instead of onReplyToMessage for broader capture, then filtering.

    } else { // If it's a question expecting a text reply
        // Listen for a text reply to the question message
       const replyListener = async (replyMsg) => {
            // Make sure this reply is actually to our question message and from the right user
            if (replyMsg.reply_to_message && replyMsg.reply_to_message.message_id === questionMessage.message_id && replyMsg.chat.id === originalMessage.chat.id) {
                bot.removeListener("message", replyListener); // Stop listening for replies to this message now

                onAnswerReceived(replyMsg, currentQuestionIndex); // Send the answer (text) back

                currentQuestionIndex++; // Move to the next question index
                if (currentQuestionIndex < questions.length) { // If there are more questions
                    askNextQuestion(questions[currentQuestionIndex], originalMessage, bot, onAnswerReceived); // Ask the next one
                }
            }
        };
        bot.on('message', replyListener); // Listen for any message and then check if it's a reply
    }
}
