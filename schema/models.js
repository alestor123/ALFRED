const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    chatId: { type: String, required: true, unique: true },
    name: String,
    username: String,
    registeredAt: { type: Date, default: Date.now },
    settings: {
        motivationCount: { type: Number, default: 0 },
        motivationChannelID: String,
        lastMotivationAt: Date,
        leetcode: {
            username: String,
            lastChecked: Date
        },
        events: {
            lastSearchPreferences: {
                type: { type: String, enum: ['hackathon', 'meetup', 'workshop'] },
                mode: { type: String, enum: ['online', 'offline', 'hybrid'] }
            },
            lastSearchTime: Date,
            notifications: { type: Boolean, default: true }
        },
        availability: [{
            date: Date,
            slots: [{
                startTime: String,
                endTime: String
            }]
        }],
        isSilenced: { type: Boolean, default: false },
        language: { type: String, default: 'en' }
    }
});

// Cache Schema for temporary data
const cacheSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: mongoose.Schema.Types.Mixed,
    expiresAt: { type: Date, index: { expires: 0 } }
});

// Task Schema
const taskSchema = new mongoose.Schema({
    chatId: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    priority: { type: String, enum: ['high', 'medium', 'low'], required: true },
    createdAt: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    metadata: {
        important: { type: Boolean, required: true },
        urgent: { type: Boolean, required: true },
        category: { type: String, enum: ['DO', 'PLAN', 'DELEGATE', 'ELIMINATE'], required: true }
    },
    completedAt: Date,
    reminders: [{
        time: Date,
        sent: { type: Boolean, default: false }
    }]
});

// Event Schema
const eventSchema = new mongoose.Schema({
    type: { type: String, required: true }, // hackathon, meetup, etc.
    name: String,
    website: String,
    start: Date,
    end: Date,
    mode: String,
    location: {
        city: String,
        state: String,
        countryCode: String,
        gmaps: String,
        latitude: Number,
        longitude: Number
    },
    createdAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Cache = mongoose.model('Cache', cacheSchema);
const Task = mongoose.model('Task', taskSchema);
const Event = mongoose.model('Event', eventSchema);

// Reminder Schema
const reminderSchema = new mongoose.Schema({
    chatId: { type: String, required: true },
    reminderText: { type: String, required: true },
    reminderTime: { type: Date, required: true },
    isSent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = {
    User,
    Cache,
    Task,
    Event,
    Reminder
}; 