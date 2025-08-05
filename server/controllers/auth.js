// In-memory OTP store (for demo; use Redis or DB in production)
const otpStore = {};

// Send OTP to email
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: 'Email required' });
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore[email] = otp;
  try {
    // Send OTP via email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
    await transporter.sendMail({
      to: email,
      subject: 'Your OTP for MediConnect Registration',
      text: `Your OTP is: ${otp}`,
    });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: 'Failed to send OTP' });
  }
};

// Verify OTP
exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.json({ success: false, message: 'Email and OTP required' });
  if (otpStore[email] && otpStore[email] === otp) {
    delete otpStore[email];
    return res.json({ success: true });
  }
  res.json({ success: false, message: 'Invalid OTP' });
};
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user');

exports.register = async (req, res) => {
  const { name, email, password, age, role, location } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, age, role, location });
    await user.save();

    if (role === 'doctor') {
      // Send notification to doctor
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      transporter.sendMail({
        to: user.email,
        subject: 'Doctor Approval Notification',
        text: 'You have successfully registered. Your profile is pending admin approval.',
      });

      return res.status(200).json({ message: 'Registered. Awaiting admin approval.' });
    }

    const token = jwt.sign({ id: user._id }, 'secret');
    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.status(200).json({ user, token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};
