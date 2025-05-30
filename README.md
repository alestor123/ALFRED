# Alfred - Your Personal Productivity Butler 🎩

Alfred is a Telegram bot that helps you stay productive and organized. It's your personal butler for managing tasks, reminders, events, and more.

## Features 🌟

- Task Management
- Event Planning
- Availability Tracking
- Reminders
- LeetCode Progress Tracking
- Motivation Quotes
- Educational Resources

## Prerequisites 📋

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Telegram Bot Token (from @BotFather)

## Installation 🚀

1. Clone the repository:
```bash
git clone https://github.com/yourusername/alfred.git
cd alfred
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```env
BOT_TOKEN=your_telegram_bot_token_here
MONGODB_URI=mongodb://localhost:27017/alfred
```

## Migration from JSON to MongoDB 🔄

If you're upgrading from the JSON-based storage to MongoDB:

1. Make sure MongoDB is running and accessible
2. Run the migration script:
```bash
npm run migrate
```

This will:
- Connect to MongoDB
- Read data from the existing JSON files
- Create corresponding documents in MongoDB
- Preserve all your existing data

## Usage 🤖

1. Start the bot:
```bash
npm start
```

2. Open Telegram and search for your bot
3. Start a conversation with `/start`
4. Follow the menu options to use various features

## Commands 📝

- `/start` or `/menu` - Show main menu
- `/register` - Register as a new user
- `/task` - Add a new task
- `/tasks` - View all tasks
- `/events` - Manage events
- `/availability` - Set your availability
- `/leetcode` - Track LeetCode progress
- `/motivation` - Get motivational quotes

## Contributing 🤝

Feel free to open issues and submit pull requests!

## License 📄

MIT License - see LICENSE file for details

<h1 align=center>Name</h1>
<p align=center>

<img src="https://img.shields.io/github/license/alestor123/Name" alt=views >
<a href="https://github.com/alestor123/Name/issues">
<img src="https://img.shields.io/github/issues-raw/alestor123/Name"></a>
<a href="https://www.npmjs.com/package/Name-manage"><img src="https://img.shields.io/npm/v/Name-manage"></a>
</p>

# 
> Description
<p align=center>
<a href="https://npmjs.org/package/Name-manage">
<img src="https://nodei.co/npm/Name-manage.png"></a>
</p>

# Documentation

# Quick use

``npx Name-manage``

# Installation

``npm i Name-manage -g ``

# Usage

``Name-manage <port number> <key>``

# Example
``Name-manage 3000 key ``

# Env

## Creating Env
``touch .env``

# Env Example
