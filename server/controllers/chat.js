const Chat = require('../models/chat');
const User = require('../models/user');

// Start a chat between doctor and patient (or return existing)
exports.startChat = async (req, res) => {
  const { doctorId, patientId } = req.body;
  if (!doctorId || !patientId) return res.status(400).json({ message: 'doctorId and patientId required' });
  try {
    let chat = await Chat.findOne({ participants: { $all: [doctorId, patientId] } });
    if (!chat) {
      chat = new Chat({ participants: [doctorId, patientId], messages: [] });
      await chat.save();
    }
    res.json({ chat });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a message in a chat
exports.sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { senderId, content } = req.body;
  if (!senderId || !content) return res.status(400).json({ message: 'senderId and content required' });
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    chat.messages.push({ senderId, content });
    await chat.save();
    res.json({ message: 'Message sent', chat });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all messages in a chat
exports.getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json({ messages: chat.messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  const { userId } = req.params;
  try {
    const chats = await Chat.find({ participants: userId });
    res.json({ chats });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
