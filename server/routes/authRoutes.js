const express = require('express');
const { register, login, sendOtp, verifyOtp } = require('../controllers/auth');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});


module.exports = router;