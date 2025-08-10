const User = require('../models/user');

// GET /api/patient/findDoctors/:zip
exports.findDoctorsByZip = async (req, res) => {
  const { zip } = req.params;
  try {
    // Only approved doctors in this zip
    const doctors = await User.find({ role: 'doctor', approvedByAdmin: true, zip });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
};
