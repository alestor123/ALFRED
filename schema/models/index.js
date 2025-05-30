const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    chatId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    fullname: { type: String, required: true },
    leetcode: { type: String },
    wakeupTime: { type: String },
    bedTime: { type: String },
    motivationChannelID: { type: String },
    studyPrefTime: { type: String },
    workPrefTime: { type: String },
    exercisePrefTime: { type: String },
    chorePrefTime: { type: String },
    goalPrefTime: { type: String },
    idlePrefTime: { type: String },
    settings: {
        isSilenced: { type: Boolean, default: false }
    },
    reminders: [{
        id: { type: Number },
        name: { type: String },
        type: { type: String },
        active: { type: Boolean, default: false },
        time: { type: String },
        periodicity: { type: String },
        message: { type: String }
    }],
    tasks: [{
        id: { type: String },
        title: { type: String },
        description: { type: String },
        isCompleted: { type: Boolean, default: false },
        stats: { type: String },
        priorityIndex: { type: Number },
        createAT: { type: Number }
    }],
    createdAt: { type: Date, default: Date.now }
});

// Event Schema
const eventSchema = new mongoose.Schema({
    chatId: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    time: { type: String },
    location: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Availability Schema
const availabilitySchema = new mongoose.Schema({
    chatId: { type: Number, required: true },
    date: { type: Date, required: true },
    slots: [{
        startTime: { type: String },
        endTime: { type: String },
        status: { type: String, enum: ['available', 'busy', 'tentative'] }
    }],
    createdAt: { type: Date, default: Date.now }
});

// Cache Schema (for temporary data)
const cacheSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed },
    expiresAt: { type: Date }
});

// Create models
const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);
const Availability = mongoose.model('Availability', availabilitySchema);
const Cache = mongoose.model('Cache', cacheSchema);

module.exports = {
    User,
    Event,
    Availability,
    Cache
}; 