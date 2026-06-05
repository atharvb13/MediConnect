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

const copilotController = require('./copilot');

exports.analyzeChart = copilotController.analyzeChart;
exports.normalizeChart = copilotController.normalizeChart;
exports.uploadChart = copilotController.uploadChart;

exports.getPatientProfile = async (req, res) => {
  try {
    const patient = await User.findById(req.user.id).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching profile' });
  }
};


exports.updatePatientProfile = async (req, res) => {
  try {
    // req.user.id comes from the 'protect' middleware
    const patient = await User.findById(req.user.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update fields (add more fields as necessary based on your Schema)
    // Using explicit assignment is safer than spreading req.body blindly
    patient.name = req.body.name || patient.name;
    patient.bloodGroup = req.body.bloodGroup || patient.bloodGroup;
    patient.dob = req.body.dob || patient.dob;
    patient.gender = req.body.gender || patient.gender;
    patient.location = req.body.location || patient.location;

    // If you need to handle complex objects like address or medical history, do it here

    const updatedPatient = await patient.save();

    res.status(200).json({
      success: true,
      data: updatedPatient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating profile' });
  }
};
