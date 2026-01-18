const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }],
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: '' 
  },
  initiatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  messages: [messageSchema]
}, { 
  timestamps: true // Adds createdAt and updatedAt
});

// Find chats involving a user
chatSchema.index({ participants: 1 });

// Faster chat list sorting
chatSchema.index({ updatedAt: -1 });

// Prevent duplicate 1-to-1 chats (IMPORTANT)
chatSchema.index(
  { participants: 1 },
  { unique: true }
);

// Filter by status (pending/accepted)
chatSchema.index({ status: 1 });


module.exports = mongoose.model('Chat', chatSchema);