const fs = require('fs'); // For reading files from the computer
const path = require('path'); // For working with file paths (like finding UPDATES.md)
const logger = require('../utils/logging/logs'); // For printing messages to the console
const { User } = require('../schema/models'); // To check if the user is registered
const { sendTranslatedMessage } = require('../utils/translateAndSend'); // Our special function for sending messages
const { Marked } = require('marked'); // The library we use to understand Markdown

// This is a special set of rules for the 'marked' library.
// It tells 'marked' to turn Markdown into plain text instead of HTML.
class PlainTextRenderer {
  // For block elements (like code blocks, paragraphs, lists)
  code(code, language) { return '' + code + '\n\n'; } // Show code as is, with blank lines around it
  blockquote(quote) { return '> ' + quote + '\n\n'; } // Put a '>' before quotes
  html(html) { return ''; } // IMPORTANT: This removes any HTML tags it finds in the Markdown
  heading(text, level) { return text + '\n\n'; } // Headings become plain text, followed by blank lines
  hr() { return '-----\n\n'; } // Horizontal lines become dashes
  list(body, ordered, start) { return body + '\n'; } // For lists, just output the items
  listitem(text) { return '- ' + text + '\n'; } // List items start with a '-'
  checkbox(checked) { return checked ? '[x] ' : '[ ] '; } // Checkboxes like [x] or [ ]
  paragraph(text) { return text + '\n\n'; } // Paragraphs are text with blank lines after
  table(header, body) { return header + '\n' + body + '\n'; } // Tables just become text
  tablerow(content) { return content + '\n'; }
  tablecell(content, flags) { return content + '\t'; } // Separate table cells with a tab

  // For inline elements (like bold, italic, links)
  strong(text) { return text; } // Bold text becomes normal text
  em(text) { return text; } // Italic text becomes normal text
  codespan(text) { return text; } // Inline code becomes normal text
  br() { return '\n'; } // Line breaks become newlines
  del(text) { return text; } // Strikethrough text becomes normal text
  link(href, title, text) { return text + (href ? ' (' + href + ')' : ''); } // Links become "text (url)"
  image(href, title, text) { return text + (href ? ' (' + href + ')' : ''); } // Images also "text (url)"
  text(text) { return text; } // Regular text stays as is
}

// Create an instance of 'marked' using our custom plain text rules
const markedInstance = new Marked({ renderer: new PlainTextRenderer() });

// This function handles showing the bot updates from UPDATES.md
module.exports = async (msg_or_callbackQuery, bot) => {
    // Figure out if this was from a button click or a command
    const isCallback = msg_or_callbackQuery.message !== undefined;
    const chatId = isCallback ? msg_or_callbackQuery.message.chat.id : msg_or_callbackQuery.chat.id; // Get the chat ID
    
    let messageToEditId; // We'll store the ID of the message we want to edit (e.g., "Loading..." message)

    try {
        // Check if the user is registered
        const user = await User.findOne({ chatId: String(chatId) });
        if (!user) {
            // If the user isn't registered, tell them to /start
            await sendTranslatedMessage(bot, chatId, '❌ Please register first using /start command.');
            return; // Stop if not registered
        }

        // If this was from a command (not a button click), send a "Loading..." message first
        if (isCallback) {
            // If it's a callback, we already have a message to edit (the one with the button)
            messageToEditId = msg_or_callbackQuery.message.message_id;
        } else {
            // Send "Fetching updates..." and get its ID so we can edit it later
            const sentLoadingMessage = await sendTranslatedMessage(bot, chatId, "🔄 Fetching latest bot updates...");
            if (sentLoadingMessage && sentLoadingMessage.message_id) {
                messageToEditId = sentLoadingMessage.message_id;
            } else {
                // If sending the loading message failed for some reason
                logger.error('Failed to send initial loading message or get its ID (using sendTranslatedMessage).');
                await sendTranslatedMessage(bot, chatId, "❌ An error occurred while trying to load updates. (Could not send loading message)");
                return;
            }
        }

        // Double-check we have a message ID to edit
        if (!messageToEditId) {
            logger.error('messageToEditId is not set in updates controller.');
            await sendTranslatedMessage(bot, chatId, "❌ A critical error occurred. (messageToEditId missing)");
            return;
        }
        
        // Find the UPDATES.md file
        const updatesFilePath = path.join(__dirname, '..', 'UPDATES.md'); // __dirname is the current folder
        let markdownContent = ""; // To store what's in UPDATES.md
        let plainTextContent = ""; // To store the plain text version

        try {
            // Try to read the UPDATES.md file
            markdownContent = fs.readFileSync(updatesFilePath, 'utf8');
            if (!markdownContent.trim()) { 
                // If the file is empty or just whitespace
                plainTextContent = "ℹ️ No updates information is currently available.";
            } else {
                // Convert the Markdown content to plain text using our special 'marked' instance
                plainTextContent = markedInstance.parse(markdownContent).trim();
                // Just to be extra sure, remove any HTML tags that might have slipped through
                plainTextContent = plainTextContent.replace(/<[^>]*>/g, '');
            }
        } catch (fileError) {
            // If we couldn't read the file (e.g., it doesn't exist)
            logger.error('Error reading or parsing UPDATES.md to plain text:', fileError);
            plainTextContent = "❌ Sorry, couldn't load the update notes at this time.";
        }
        
        // Prepare options for editing the message
        const options = {
            chat_id: chatId,
            message_id: messageToEditId,
            // No parse_mode needed, because we are sending plain text
            disable_web_page_preview: true // Don't show previews for any links in the updates
        };

        // Edit the original "Loading..." message (or the message with the button) to show the updates
        await bot.editMessageText(plainTextContent, options);
        logger.info(`Sent UPDATES.md content as plain text to chat ID: ${chatId}`);

    } catch (error) {
        // If anything else went wrong
        logger.error('Error in updates controller (displaying UPDATES.md as plain text): ' + error.message);
        logger.error('Stack trace: ' + error.stack); // More detailed error for developer

        const errorMessageText = "❌ An error occurred while fetching bot updates.";
        // Try to edit the message to show an error, or send a new one
        if (messageToEditId) { 
            try {
                await bot.editMessageText(errorMessageText, {
                    chat_id: chatId,
                    message_id: messageToEditId
                });
            } catch (editError) {
                 // If editing the message to show error also fails
                 logger.error('Error editing message to show error: ' + editError.message);
                 // If it wasn't a callback (meaning we sent a "loading" message), try sending a new error message.
                 // If it WAS a callback, the user already has a message, and sending another might be confusing.
                 if (!isCallback) { 
                    await sendTranslatedMessage(bot, chatId, errorMessageText);
                 }
            }
        } else { 
            // If we didn't even have a messageToEditId (e.g., initial loading message failed to send)
            await sendTranslatedMessage(bot, chatId, errorMessageText);
        }
    }
}; 