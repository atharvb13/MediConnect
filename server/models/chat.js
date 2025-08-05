const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  participants: [String], // userIds
  messages: [messageSchema],
});

module.exports = mongoose.model('Chat', chatSchema);