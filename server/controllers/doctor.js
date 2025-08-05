const Chat = require('../models/chat');

exports.sendMessage = async (req, res) => {
  const { chatId, senderId, content } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    chat.messages.push({ senderId, content });
    await chat.save();
    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getChat = async (req, res) => {
  const { userId1, userId2 } = req.query;
  try {
    let chat = await Chat.findOne({ participants: { $all: [userId1, userId2] } });
    if (!chat) {
      chat = new Chat({ participants: [userId1, userId2], messages: [] });
      await chat.save();
    }
    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};