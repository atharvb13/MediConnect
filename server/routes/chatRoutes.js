const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat');

// Start a chat or get existing chat between doctor and patient
router.post('/start', chatController.startChat);
router.put('/approve/:chatId', chatController.approveChat);
// Send a message in a chat
router.post('/:chatId/message', chatController.sendMessage);

// Get all messages in a chat
router.get('/:chatId/messages', chatController.getMessages);

// Get all chats for a user
router.get('/user/:userId', chatController.getUserChats);

module.exports = router;
