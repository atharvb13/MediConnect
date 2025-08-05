const express = require('express');
const { sendMessage, getChat } = require('../controllers/doctor');
const router = express.Router();

router.post('/send-message', sendMessage);
router.get('/get-chat', getChat);

module.exports = router;