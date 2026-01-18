const User = require('../models/user');


exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findById(req.user.id).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching profile' });
  }
};

exports.updateDoctorProfile = async (req, res) => {
  try {
    // req.user.id comes from the 'protect' middleware
    const doctor = await User.findById(req.user.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Update fields (add more fields as necessary based on your Schema)
    // Using explicit assignment is safer than spreading req.body blindly
    doctor.name = req.body.name || doctor.name;
    doctor.bloodGroup = req.body.bloodGroup || doctor.bloodGroup;
    doctor.dob = req.body.dob || doctor.dob;
    doctor.gender = req.body.gender || doctor.gender;
    doctor.location = req.body.location || doctor.location;
    doctor.zip = req.body.zip || doctor.zip;
    

    // If you need to handle complex objects like address or medical history, do it here

    const updatedDoctor = await doctor.save();

    res.status(200).json({
      success: true,
      data: updatedDoctor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating profile' });
  }
};