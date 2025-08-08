const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    conversation: [{
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        context: {
            type: Object,
            default: {}
        }
    }],
    sessionId: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        enum: ['budgeting', 'investing', 'saving', 'debt', 'general'],
        default: 'general'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Chat', chatSchema);