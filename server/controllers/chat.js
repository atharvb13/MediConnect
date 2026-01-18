const Chat = require('../models/chat');

exports.startChat = async (req, res) => {
  const { doctorId, patientId } = req.body;
  try {
    let chat = await Chat.findOne({ participants: { $all: [doctorId, patientId] } });
    
    if (chat) {
      return res.json({ chat, alreadyExists: true });
    }

    // Create a new request if it doesn't exist
    chat = new Chat({ 
      participants: [doctorId, patientId], 
      messages: [],
      status: 'pending',
      initiatedBy: patientId 
    });
    
    await chat.save();

    res.json({ chat, alreadyExists: false });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// New function to approve chat
exports.approveChat = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      req.params.chatId, 
      { status: 'accepted' }, 
      { new: true }
    );
    res.json({ message: 'Chat accepted', chat });
  } catch (err) {
    res.status(500).json({ message: 'Error approving chat' });
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
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name role profession') 
      .sort({ updatedAt: -1 });

    res.json({ chats });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
