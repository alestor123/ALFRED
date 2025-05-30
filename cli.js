#!/usr/bin/env node

var bot = require('./App');
require('dotenv').config()
bot(process.env.BOT_TOKEN)