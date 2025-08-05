const User = require('../models/user');
const nodemailer = require('nodemailer');

exports.approveDoctor = async (req, res) => {
  const { doctorId, email } = req.body;
  try {
    await User.findByIdAndUpdate(doctorId, { approvedByAdmin: true }, { new: true });

    // Send email to doctor after approval
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
            to: email,
            subject: 'Doctor Approval Notification',
            text: 'Your profile has been approved. You can now start using MediConnect',
          });
    

    res.status(200).json({ message: 'Doctor approved and notified.' });
  } catch (err) {
    res.status(500).json({ message: 'Error approving doctor' });
  }
};

exports.getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await User.find({ role: 'doctor', approvedByAdmin: false });
    res.status(200).json(pendingDoctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending doctors' });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', approvedByAdmin: true });
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
};
