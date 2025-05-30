const fs = require('fs');
const path = require('path');
const logger = require('../utils/logging/logs');

const studyDataPath = path.join(__dirname, '..', 'STUDY.json');
let studyData = {};

try {
    const rawData = fs.readFileSync(studyDataPath, 'utf8');
    studyData = JSON.parse(rawData);
    logger.info('STUDY.json loaded and parsed successfully.');
    logger.info('Available branches: ' + JSON.stringify(Object.keys(studyData.branches)));
} catch (error) {
    logger.error('Failed to load or parse STUDY.json:', error);
    studyData = { branches: {} }; 
}

// Main function to start the study menu (shows branches)
async function startStudyMenu(msg, bot) {
    const chatId = msg.chat.id;
    logger.info(`Starting study menu for chat ID: ${chatId}`);
    
    if (!studyData || !studyData.branches || Object.keys(studyData.branches).length === 0) {
        logger.warn('Study data is unavailable. studyData.branches: ' + JSON.stringify(studyData.branches));
        await bot.sendMessage(chatId, '😔 Sorry, study materials data is currently unavailable. Please try again later.');
        return;
    }

    const branches = Object.keys(studyData.branches);
    logger.info('Creating keyboard with branches: ' + JSON.stringify(branches));
    
    const inline_keyboard = branches.map(branch => ([{
        text: `📚 ${branch}`,
        callback_data: `study_branch_${branch}`
    }]));

    try {
        await bot.sendMessage(chatId, '🎓 Please select a branch for study materials:', {
            reply_markup: {
                inline_keyboard
            }
        });
        logger.info('Study menu message sent successfully');
    } catch (error) {
        logger.error('Failed to send study menu message:', error);
    }
}

// Handle callback queries for the study menu
async function handleStudyCallback(callbackQuery, bot) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    logger.info(`Study callback received: ${data} for chat ID: ${chatId}`);

    try {
        // Handle back to start
        if (data === 'study_start') {
            await startStudyMenu({ chat: { id: chatId } }, bot);
            return;
        }

        const parts = data.split('_');
        if (parts[0] !== 'study') {
            logger.warn('Non-study callback received in handleStudyCallback:', data);
            return;
        }

        const actionType = parts[1];
        logger.info(`Processing study action type: ${actionType}`);

        // Helper function to send or edit message
        async function sendOrEditMessage(text, keyboard) {
            try {
                await bot.editMessageText(text, {
                    chat_id: chatId,
                    message_id: callbackQuery.message.message_id,
                    reply_markup: { inline_keyboard: keyboard },
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                });
            } catch (editError) {
                logger.warn('Failed to edit message, sending new message instead:', editError);
                await bot.sendMessage(chatId, text, {
                    reply_markup: { inline_keyboard: keyboard },
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                });
            }
        }

        if (actionType === 'branch') {
            const selectedBranch = parts[2];
            logger.info(`Action: branch, Selected: ${selectedBranch}`);

            if (!studyData.branches[selectedBranch]) {
                logger.error(`Branch data not found for: ${selectedBranch}`);
                await sendOrEditMessage('😔 Error: Branch data not found. Please try again.', [[{ text: '⬅️ Back to Branches', callback_data: 'study_start' }]]);
                return;
            }

            const schemes = Object.keys(studyData.branches[selectedBranch].schemes);
            logger.info(`Found schemes for branch ${selectedBranch}: ${JSON.stringify(schemes)}`);
            
            const inline_keyboard = schemes.map(scheme => ([{
                text: `📜 Scheme ${scheme}`,
                callback_data: `study_scheme_${scheme}_${selectedBranch}`
            }]));
            inline_keyboard.push([{ text: '⬅️ Back to Branches', callback_data: 'study_start'}]);

            await sendOrEditMessage(`📚 Branch: ${selectedBranch}\n📜 Please select a scheme:`, inline_keyboard);

        } else if (actionType === 'scheme') {
            const selectedScheme = parts[2];
            const selectedBranch = parts[3];
            logger.info(`Action: scheme, Selected: ${selectedScheme}, Branch: ${selectedBranch}`);

            if (!studyData.branches[selectedBranch] || !studyData.branches[selectedBranch].schemes[selectedScheme]) {
                logger.error(`Scheme data not found for: ${selectedScheme}, branch: ${selectedBranch}`);
                await sendOrEditMessage('😔 Error: Scheme data not found. Please try again.', [[{ text: '⬅️ Back to Branches', callback_data: `study_branch_${selectedBranch}` }]]);
                return;
            }

            const semesters = Object.keys(studyData.branches[selectedBranch].schemes[selectedScheme].semesters);
            logger.info(`Found semesters for scheme ${selectedScheme}: ${JSON.stringify(semesters)}`);
            
            const inline_keyboard = semesters.map(semester => ([{
                text: `🗓️ Semester ${semester}`,
                callback_data: `study_semester_${semester}_${selectedScheme}_${selectedBranch}`
            }]));
            inline_keyboard.push([{ text: '⬅️ Back to Schemes', callback_data: `study_branch_${selectedBranch}` }]);

            await sendOrEditMessage(`📚 Branch: ${selectedBranch} > 📜 Scheme: ${selectedScheme}\n🗓️ Please select a semester:`, inline_keyboard);

        } else if (actionType === 'semester') {
            const selectedSemester = parts[2];
            const selectedScheme = parts[3];
            const selectedBranch = parts[4];
            logger.info(`Action: semester, Selected: ${selectedSemester}, Scheme: ${selectedScheme}, Branch: ${selectedBranch}`);
            
            try {
                const branchData = studyData.branches[selectedBranch];
                if (!branchData) {
                    throw new Error(`Branch ${selectedBranch} not found`);
                }

                const schemeData = branchData.schemes[selectedScheme];
                if (!schemeData) {
                    throw new Error(`Scheme ${selectedScheme} not found for branch ${selectedBranch}`);
                }

                const semesterData = schemeData.semesters[selectedSemester];
                if (!semesterData) {
                    throw new Error(`Semester ${selectedSemester} not found for scheme ${selectedScheme}`);
                }

                const subjects = Object.keys(semesterData.subjects);
                if (subjects.length === 0) {
                    throw new Error(`No subjects found for semester ${selectedSemester}`);
                }

                logger.info(`Found subjects for semester ${selectedSemester}: ${JSON.stringify(subjects)}`);
                
                const inline_keyboard = subjects.map(subject => ([{
                    text: `📖 ${subject}`,
                    callback_data: `study_subject_${encodeURIComponent(subject)}_${selectedSemester}_${selectedScheme}_${selectedBranch}`
                }]));
                inline_keyboard.push([{ text: '⬅️ Back to Semesters', callback_data: `study_scheme_${selectedScheme}_${selectedBranch}` }]);

                await sendOrEditMessage(`📚 Branch: ${selectedBranch} > 📜 Scheme: ${selectedScheme} > 🗓️ Sem: ${selectedSemester}\n📖 Please select a subject:`, inline_keyboard);

            } catch (error) {
                logger.error(`Error processing semester selection: ${error.message}`);
                let backButton;
                if (error.message.includes('Branch')) {
                    backButton = [{ text: '⬅️ Back to Branches', callback_data: 'study_start' }];
                } else if (error.message.includes('Scheme')) {
                    backButton = [{ text: '⬅️ Back to Schemes', callback_data: `study_branch_${selectedBranch}` }];
                } else {
                    backButton = [{ text: '⬅️ Back to Semesters', callback_data: `study_scheme_${selectedScheme}_${selectedBranch}` }];
                }
                await sendOrEditMessage(`😔 ${error.message}. Please try again.`, [backButton]);
            }

        } else if (actionType === 'subject') {
            const subjectName = decodeURIComponent(parts[2]);
            const selectedSemester = parts[3];
            const selectedScheme = parts[4];
            const selectedBranch = parts[5];
            logger.info(`Action: subject, Selected: ${subjectName}, Sem: ${selectedSemester}, Scheme: ${selectedScheme}, Branch: ${selectedBranch}`);
            
            try {
                const subjectData = studyData.branches[selectedBranch].schemes[selectedScheme].semesters[selectedSemester].subjects[subjectName];
                if (!subjectData) {
                    throw new Error(`Subject ${subjectName} not found`);
                }

                logger.info(`Found subject data: ${JSON.stringify(subjectData)}`);
                
                let message = `📚 *${subjectName}* (${selectedBranch} - ${selectedScheme} - ${selectedSemester})\n\n`;
                let hasLinks = false;
                
                if (subjectData.ktunotes) {
                    message += `🔗 KTU Notes: [Link](${subjectData.ktunotes})\n`;
                    hasLinks = true;
                }
                
                if (subjectData.ktuspecial) {
                    message += `🔗 KTU Special: [Link](${subjectData.ktuspecial})\n`;
                    hasLinks = true;
                }

                if (!hasLinks) {
                    message += "😔 No study materials available for this subject yet.";
                }

                const inline_keyboard = [[{ 
                    text: '⬅️ Back to Subjects', 
                    callback_data: `study_semester_${selectedSemester}_${selectedScheme}_${selectedBranch}` 
                }]];

                await sendOrEditMessage(message, inline_keyboard);

            } catch (error) {
                logger.error(`Error processing subject selection: ${error.message}`);
                await sendOrEditMessage(`😔 ${error.message}. Please try again.`, [[{ 
                    text: '⬅️ Back to Subjects', 
                    callback_data: `study_semester_${selectedSemester}_${selectedScheme}_${selectedBranch}` 
                }]]);
            }
        }
    } catch (error) {
        logger.error(`Error in handleStudyCallback: ${error.message}`);
        await bot.sendMessage(chatId, '😔 An error occurred while processing your request. Please try again.');
    }
}

module.exports = {
    startStudyMenu,
    handleStudyCallback
}; 