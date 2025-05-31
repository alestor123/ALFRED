# Alfred - Your Personal Telegram Butler! 🤖

Alfred is not just another Telegram bot; it's your very own digital assistant, inspired by the ever-reliable Alfred Pennyworth. Designed to help you manage your tasks, stay motivated, and keep your schedule in order, Alfred is here to bring a bit of productive calm to your digital life.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Issues](https://img.shields.io/github/issues/your_username/ALFRED)](https://github.com/your_username/ALFRED/issues) 
<!-- Add other relevant badges here: e.g., build status, npm version if applicable -->

## 🌟 Introduction

In a world serviços with distractions, Alfred steps in to streamline your productivity. Whether it's juggling daily tasks, getting timely reminders, finding educational resources, or just needing a spark of motivation, Alfred is equipped to assist. Built with Node.js and MongoDB, it's designed to be a reliable companion.

## ✨ Features

Alfred comes packed with a variety of features to enhance your productivity and Telegram experience:

*   **📝 Task Management:**
    *   Easily add new tasks with details like name, description, type, priority, and due dates.
    *   View your tasks for the day.
    *   Get daily reports on your task progress.
*   **⏰ Smart Reminders:**
    *   Receive reminders 5 minutes before your task's start time.
    *   Reminders are sent once per task and respect your mute/unmute notification settings.
*   **🌐 Multi-Language Support:**
    *   Choose your preferred language: English, Malayalam, or Hindi.
    *   Alfred automatically translates outgoing messages to your selected language.
*   **💪 Motivational Quotes:**
    *   Get a random Zen quote for a dose of inspiration, with no daily limits.
*   **📚 Educational Resources:**
    *   Access study materials categorized by educational branches, schemes, and semesters.
*   **💻 LeetCode Status Tracking:**
    *   Keep an eye on your LeetCode progress. (Details via the LeetCode menu option)
*   **👤 Profile Management:**
    *   View and manage your user profile within the bot.
*   **🔄 Bot Updates:**
    *   Stay informed about the latest features and fixes directly through the "Updates" section.
*   **⚙️ Notification Settings:**
    *   Mute or unmute bot notifications based on your preference.
*   **🗓️ Event Planning:** (Functionality for event searching/management)
*   **⏱️ Availability Tracking:** (Lets you set and share your available time slots)
*   **ℹ️ About Section:** Get more information about Alfred.

## 🛠️ Prerequisites

Before you get started, make sure you have the following installed:

*   **Node.js:** Latest LTS version recommended (e.g., v18.x or v20.x)
*   **MongoDB:** A running instance (e.g., v5.x, v6.x, or a cloud-hosted MongoDB Atlas instance)
*   **Telegram Bot Token:** You'll need to create a bot via [BotFather](https://t.me/botfather) on Telegram to get your unique token.

## 🚀 Installation

Setting up Alfred locally is straightforward:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your_username/ALFRED.git 
    # Replace with your actual repository URL
    cd ALFRED
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables:**
    Alfred requires a few environment variables to run. Create a `.env` file in the root of the project and add the following:
    ```env
    BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN_HERE
    MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING_HERE
    # Add any other necessary environment variables
    ```
    Replace the placeholder values with your actual credentials.

## 📊 Migration from JSON to MongoDB (If Applicable)

This project includes a script to migrate data from legacy JSON files (if you were using a previous version that stored data in `db.json` or similar) to MongoDB. This ensures your existing user data, tasks, etc., are preserved.

*   **Script:** `migrate-to-mongo.js`
*   **How to Run:**
    1.  Ensure your MongoDB instance is running and accessible.
    2.  Configure your `MONGODB_URI` in the `.env` file.
    3.  The script is designed to be run once. Examine the script to understand which JSON files it expects and update paths if necessary.
    4.  Execute the script:
        ```bash
        node migrate-to-mongo.js
        ```
    5.  Verify in your MongoDB database that the data has been imported correctly.

**Note:** Always back up your JSON data before running any migration script.

## 🤖 Usage

Once installed and configured, you can start Alfred:

1.  **Start the Bot:**
    ```bash
    npm start
    ```
    This command typically runs `node cli.js` as defined in your `package.json`.

2.  **Interact with Alfred on Telegram:**
    Open Telegram and find the bot you created with BotFather. You can start interacting with it using the commands listed below.

## ⌨️ Available Commands

Here are some of the primary commands you can use with Alfred:

*   `/start` or `/menu`: Displays the main interactive menu.
*   `/register`: (Usually part of the initial `/start` flow if you're a new user)
*   `/task`: Begins the process of adding a new task.
*   `/tasks`: Fetches and displays your current tasks.
*   `/motivation`: Gets a motivational quote.
*   `/leetcode`: Shows your LeetCode status.
*   `/study` (or `/education`): Accesses educational materials.
*   `/events`: (For event-related features)
*   `/availability`: (For managing your availability)
*   `/report`: Generates a daily report.
*   `/updates`: Shows the latest news and updates about Alfred.

Explore the inline buttons in the menu for more functionalities!

## 🤝 Contributing

Contributions are welcome and appreciated! If you have an idea for a new feature, find a bug, or want to improve the documentation, please feel free to:

1.  **Open an Issue:** Discuss the changes you'd like to make or report a bug.
2.  **Fork the Repository:** Create your own copy to work on.
3.  **Create a Pull Request:** Submit your changes for review.

Please try to follow the existing coding style and add relevant tests if applicable.

## 📜 License

This project is licensed under the **MIT License**. See the `LICENSE` file for more details.
(Note: If you don't have a LICENSE file, you might want to create one. MIT is a common choice for open-source projects.)

## 📸 Screenshots / GIFs

*(Consider adding a few screenshots or GIFs here to showcase Alfred in action!)*

*   *Main Menu Interaction*
*   *Adding a Task*
*   *Receiving a Reminder*
*   *Language Selection*

---

Let Alfred help you conquer your day!
